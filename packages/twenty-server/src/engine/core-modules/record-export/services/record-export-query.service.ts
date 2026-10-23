import { BadRequestException, Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { buildRecordExportColumns, isDefined } from 'twenty-shared/utils';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RECORD_EXPORT_PAGE_SIZE } from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';
import { type RecordExportQueryContext } from 'src/engine/core-modules/record-export/types/record-export-query-context.type';
import { expandMorphRelationExportFields } from 'src/engine/core-modules/record-export/utils/expand-morph-relation-export-fields.util';
import { getRecordExportLocale } from 'src/engine/core-modules/record-export/utils/get-record-export-locale.util';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { resolveEffectiveTranslatedFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-translated-flat-entity.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordExportQueryService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly commonFindManyQueryRunnerService: CommonFindManyQueryRunnerService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  async buildContext({
    parameters,
    authContext,
    shouldIncludeInactiveFields = false,
  }: {
    parameters: Pick<
      RecordExportParameters,
      'objectMetadataId' | 'fieldMetadataIds'
    >;
    authContext: WorkspaceAuthContext;
    shouldIncludeInactiveFields?: boolean;
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
          locale: getRecordExportLocale(authContext),
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
    if (
      !shouldIncludeInactiveFields &&
      fields.some((field) => !field.isActive)
    ) {
      throw new BadRequestException(t`An export field is no longer available.`);
    }
    const columns = buildRecordExportColumns(
      expandMorphRelationExportFields({
        fields,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        shouldIncludeInactiveFields,
      }),
    );
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
