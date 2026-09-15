import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';
import {
  ForbiddenException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import {
  type UserWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { RECORD_EXPORT_PAGE_SIZE } from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';
import { type RecordExportColumn } from 'src/engine/core-modules/record-export/types/record-export-column.type';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';
import { buildRecordExportColumns } from 'src/engine/core-modules/record-export/utils/build-record-export-columns.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { resolveEffectiveTranslatedFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-translated-flat-entity.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type RecordExportQueryContext = {
  queryRunnerContext: CommonBaseQueryRunnerContext;
  columns: RecordExportColumn[];
  selectedFields: CommonSelectedFields;
};

@Injectable()
export class RecordExportQueryWorkspaceService {
  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly commonFindManyQueryRunnerService: CommonFindManyQueryRunnerService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  async assertCanExport(
    authContext: WorkspaceAuthContext,
  ): Promise<UserWorkspaceAuthContext> {
    if (
      !isUserAuthContext(authContext) ||
      isDefined(authContext.application) ||
      isDefined(authContext.viaApplication)
    ) {
      throw new ForbiddenException(t`Sign in to export records.`);
    }

    if (
      !(await this.permissionsService.userHasWorkspaceSettingPermission({
        workspaceId: authContext.workspace.id,
        userWorkspaceId: authContext.userWorkspaceId,
        setting: PermissionFlagType.EXPORT_CSV,
      }))
    ) {
      throw new ForbiddenException(
        t`You do not have permission to export records.`,
      );
    }

    return authContext;
  }

  async resolveRequester(
    recordExport: RecordExport,
  ): Promise<UserWorkspaceAuthContext> {
    const workspaceMember = await this.userWorkspaceService.getWorkspaceMember({
      workspaceId: recordExport.workspaceId,
      workspaceMemberId: recordExport.workspaceMemberId,
    });

    if (!isDefined(workspaceMember)) {
      throw new ForbiddenException(
        t`The export requester is no longer a workspace member.`,
      );
    }

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUser({
        userId: workspaceMember.userId,
        workspaceId: recordExport.workspaceId,
        relations: ['user', 'workspace'],
      });

    if (
      !isDefined(userWorkspace) ||
      userWorkspace.id !== recordExport.userWorkspaceId
    ) {
      throw new ForbiddenException(
        t`The export requester is no longer a workspace member.`,
      );
    }

    return this.assertCanExport(
      buildUserAuthContext({
        workspace: fromWorkspaceEntityToFlat(userWorkspace.workspace),
        user: fromUserEntityToFlat(userWorkspace.user),
        userWorkspaceId: userWorkspace.id,
        workspaceMember,
        workspaceMemberId: workspaceMember.id,
      }),
    );
  }

  async buildContext({
    parameters,
    authContext,
  }: {
    parameters: RecordExportParameters;
    authContext: UserWorkspaceAuthContext;
  }): Promise<RecordExportQueryContext> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
      );
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: parameters.objectMetadataId,
    });
    const rawFields = parameters.fieldMetadataIds.map((fieldMetadataId) => {
      const field = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: fieldMetadataId,
      });

      if (field.objectMetadataId !== flatObjectMetadata.id) {
        throw new BadRequestException(
          t`An export field is no longer available.`,
        );
      }

      return field;
    });
    const getI18nContext =
      await this.applicationTranslationCatalogService.getI18nContextByApplicationId(
        {
          applicationIds: rawFields.map((field) => field.applicationId),
          locale: authContext.workspaceMember.locale,
          workspaceId: authContext.workspace.id,
        },
      );
    const fields = rawFields.map((field) =>
      resolveEffectiveTranslatedFlatEntity({
        metadataName: 'fieldMetadata',
        flatEntity: field,
        i18nContext: getI18nContext(field.applicationId),
      }),
    );
    if (fields.some((field) => !field.isActive)) {
      throw new BadRequestException(t`An export field is no longer available.`);
    }
    const columns = buildRecordExportColumns(fields);
    const node: CommonSelectedFields = {};

    for (const column of columns) {
      if (isDefined(column.subFieldName)) {
        const nested = node[column.fieldName];
        node[column.fieldName] = {
          ...(typeof nested === 'object' ? nested : {}),
          [column.subFieldName]: true,
        };
      } else {
        node[column.fieldName] = true;
      }
    }

    return {
      columns,
      selectedFields: { edges: { node } },
      queryRunnerContext: {
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular: buildObjectIdByNameMaps(flatObjectMetadataMaps)
          .idByNameSingular,
      },
    };
  }

  async countRecords({
    parameters,
    context,
  }: {
    parameters: Pick<RecordExportParameters, 'filter'>;
    context: RecordExportQueryContext;
  }): Promise<number> {
    const { results } = await withWorkspaceAuthContext(
      context.queryRunnerContext.authContext,
      () =>
        this.commonFindManyQueryRunnerService.execute(
          {
            filter: parameters.filter,
            selectedFields: { ...context.selectedFields, totalCount: true },
            first: 0,
          },
          context.queryRunnerContext,
        ),
    );
    if (!isDefined(results.totalCount)) {
      throw new RecordExportException(
        'Export record count is unavailable',
        'RECORD_COUNT_UNAVAILABLE',
      );
    }
    return Number(results.totalCount);
  }

  async readPage({
    parameters,
    context,
    after,
    first = RECORD_EXPORT_PAGE_SIZE,
  }: {
    parameters: Pick<RecordExportParameters, 'filter' | 'orderBy'>;
    context: RecordExportQueryContext;
    after?: string;
    first?: number;
  }) {
    return withWorkspaceAuthContext(
      context.queryRunnerContext.authContext,
      () =>
        this.commonFindManyQueryRunnerService.execute(
          {
            filter: parameters.filter,
            orderBy: parameters.orderBy,
            selectedFields: context.selectedFields,
            first,
            after,
          },
          context.queryRunnerContext,
        ),
    );
  }
}
