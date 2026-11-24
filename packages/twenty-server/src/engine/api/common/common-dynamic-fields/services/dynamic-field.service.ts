import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { DYNAMIC_FIELD_NO_MATCH_SENTINEL_ID } from 'src/engine/api/common/common-dynamic-fields/constants/dynamic-field-no-match-sentinel-id.constant';
import { DynamicFieldResolverRegistry } from 'src/engine/api/common/common-dynamic-fields/services/dynamic-field-resolver.registry';
import { type DynamicFieldContextLoader } from 'src/engine/api/common/common-dynamic-fields/types/dynamic-field-context-loader.type';
import { type DynamicFieldFilter } from 'src/engine/api/common/common-dynamic-fields/types/dynamic-field-filter.type';
import { type DynamicFieldResolverInstance } from 'src/engine/api/common/common-dynamic-fields/types/dynamic-field-resolver-instance.type';
import { getDynamicFieldColumnNames } from 'src/engine/api/common/common-dynamic-fields/utils/get-dynamic-field-column-names.util';
import { mapDynamicFieldFilters } from 'src/engine/api/common/common-dynamic-fields/utils/map-dynamic-field-filters.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonQueryParser } from 'src/engine/api/common/common-query-parsers/common-query.parser';
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { getRelationSelectionEntries } from 'src/engine/api/common/utils/get-relation-selection-entries.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { findFlatFieldMetadataByName } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadata-by-name.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

type DynamicFieldMetadataArgs = {
  authContext: WorkspaceAuthContext;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
};

@Injectable()
export class DynamicFieldService {
  constructor(
    private readonly dynamicFieldResolverRegistry: DynamicFieldResolverRegistry,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  createContextLoader(workspaceId: string): DynamicFieldContextLoader {
    const loadingContextByDynamicFieldResolver = new Map<
      DynamicFieldResolverInstance,
      Promise<unknown>
    >();

    return <TContext>(
      dynamicFieldResolver: DynamicFieldResolverInstance<TContext>,
    ) => {
      const loadingContext =
        loadingContextByDynamicFieldResolver.get(dynamicFieldResolver) ??
        dynamicFieldResolver.loadContext({ workspaceId });

      loadingContextByDynamicFieldResolver.set(
        dynamicFieldResolver,
        loadingContext,
      );

      return loadingContext as Promise<TContext>;
    };
  }

  async assignDynamicFieldValuesToRecords({
    loadContext,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    selection,
    records,
  }: Pick<
    DynamicFieldMetadataArgs,
    'flatObjectMetadata' | 'flatFieldMetadataMaps'
  > & {
    loadContext: DynamicFieldContextLoader;
    selection: CommonSelection;
    records: ObjectRecord[];
  }): Promise<void> {
    const selectedDynamicFieldColumnNames =
      this.getSelectedDynamicFieldColumnNames({
        selection,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

    if (selectedDynamicFieldColumnNames.length === 0 || records.length === 0) {
      return;
    }

    const dynamicFieldResolver =
      this.dynamicFieldResolverRegistry.findOrThrow(flatObjectMetadata);
    const context = await loadContext(dynamicFieldResolver);

    for (const record of records) {
      const dynamicFieldValues = dynamicFieldResolver.computeValues({
        record,
        context,
      });

      for (const dynamicFieldColumnName of selectedDynamicFieldColumnNames) {
        record[dynamicFieldColumnName] =
          dynamicFieldValues[dynamicFieldColumnName] ?? null;
      }
    }
  }

  async prepareSelection({
    selection,
    ...dynamicFieldMetadataArgs
  }: DynamicFieldMetadataArgs & {
    selection: CommonSelection;
  }): Promise<void> {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = dynamicFieldMetadataArgs;

    if (
      this.getSelectedDynamicFieldColumnNames({
        selection,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      }).length > 0
    ) {
      for (const sourceColumnName of this.dynamicFieldResolverRegistry.findOrThrow(
        flatObjectMetadata,
      ).sourceColumnNames) {
        selection.columns[sourceColumnName] = true;
      }
    }

    for (const { relationSelection } of getRelationSelectionEntries(
      selection,
    )) {
      const relationFieldMetadata = findFlatFieldMetadataByName({
        fieldName: relationSelection.fieldName,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });
      const targetFlatObjectMetadata = isDefined(
        relationFieldMetadata?.relationTargetObjectMetadataId,
      )
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: relationFieldMetadata.relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;

      if (!isDefined(targetFlatObjectMetadata)) {
        continue;
      }

      if (isDefined(relationSelection.filter)) {
        relationSelection.filter = await this.rewriteDynamicFieldFilters({
          ...dynamicFieldMetadataArgs,
          filter: relationSelection.filter,
          flatObjectMetadata: targetFlatObjectMetadata,
        });
      }

      await this.prepareSelection({
        ...dynamicFieldMetadataArgs,
        selection: relationSelection.selection,
        flatObjectMetadata: targetFlatObjectMetadata,
      });
    }
  }

  async rewriteDynamicFieldFilters({
    filter,
    loadContext: providedLoadContext,
    ...dynamicFieldMetadataArgs
  }: DynamicFieldMetadataArgs & {
    filter: ObjectRecordFilter;
    loadContext?: DynamicFieldContextLoader;
  }): Promise<ObjectRecordFilter> {
    const {
      authContext,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = dynamicFieldMetadataArgs;
    const mapFilters = (
      mapDynamicFieldFilter: (
        dynamicFieldFilter: DynamicFieldFilter,
      ) => ObjectRecordFilter | undefined,
    ) =>
      mapDynamicFieldFilters({
        filter,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        mapDynamicFieldFilter,
      });

    const dynamicFieldFilters: DynamicFieldFilter[] = [];

    mapFilters((dynamicFieldFilter) => {
      dynamicFieldFilters.push(dynamicFieldFilter);

      return undefined;
    });

    if (dynamicFieldFilters.length === 0) {
      return filter;
    }

    const loadContext =
      providedLoadContext ?? this.createContextLoader(authContext.workspace.id);

    const sourceFilterByDynamicFieldFilter = new Map<
      Record<string, unknown>,
      ObjectRecordFilter
    >();

    for (const {
      flatObjectMetadata: dynamicFieldFlatObjectMetadata,
      dynamicFieldName,
      dynamicFieldFilter,
      relationTargetFlatObjectMetadata,
    } of dynamicFieldFilters) {
      const dynamicFieldResolver =
        this.dynamicFieldResolverRegistry.findOrThrow(
          dynamicFieldFlatObjectMetadata,
        );
      const context = await loadContext(dynamicFieldResolver);
      const resolvedDynamicFieldFilter = isDefined(
        relationTargetFlatObjectMetadata,
      )
        ? {
            in: await this.findMatchingRelationTargetIds({
              ...dynamicFieldMetadataArgs,
              filter: dynamicFieldFilter,
              flatObjectMetadata: relationTargetFlatObjectMetadata,
            }),
          }
        : dynamicFieldFilter;

      sourceFilterByDynamicFieldFilter.set(
        dynamicFieldFilter,
        this.computeSourceFilterOrThrow({
          dynamicFieldResolver,
          dynamicFieldName,
          dynamicFieldFilter: resolvedDynamicFieldFilter,
          context,
        }),
      );
    }

    return mapFilters(({ dynamicFieldFilter }) =>
      sourceFilterByDynamicFieldFilter.get(dynamicFieldFilter),
    );
  }

  private getSelectedDynamicFieldColumnNames({
    selection,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  }: Pick<
    DynamicFieldMetadataArgs,
    'flatObjectMetadata' | 'flatFieldMetadataMaps'
  > & {
    selection: CommonSelection;
  }): string[] {
    const selectedColumnNames = new Set([
      ...Object.keys(selection.columns),
      ...getRelationSelectionEntries(selection).map(({ relationSelection }) =>
        computeMorphOrRelationFieldJoinColumnName({
          name: relationSelection.fieldName,
        }),
      ),
    ]);

    return getDynamicFieldColumnNames({
      flatObjectMetadata,
      flatFieldMetadataMaps,
    }).filter((dynamicFieldColumnName) =>
      selectedColumnNames.has(dynamicFieldColumnName),
    );
  }

  private computeSourceFilterOrThrow<TContext>({
    dynamicFieldResolver,
    dynamicFieldName,
    dynamicFieldFilter,
    context,
  }: {
    dynamicFieldResolver: DynamicFieldResolverInstance<TContext>;
    dynamicFieldName: string;
    dynamicFieldFilter: Record<string, unknown>;
    context: TContext;
  }): ObjectRecordFilter {
    try {
      return dynamicFieldResolver.computeSourceFilter({
        dynamicFieldName,
        dynamicFieldFilter,
        context,
      });
    } catch {
      throw new CommonQueryRunnerException(
        `Filter ${JSON.stringify(dynamicFieldFilter)} is not supported on dynamic field "${dynamicFieldName}"`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`This filter is not supported on "${dynamicFieldName}"`,
        },
      );
    }
  }

  private async findMatchingRelationTargetIds({
    authContext,
    filter,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: DynamicFieldMetadataArgs & {
    filter: ObjectRecordFilter;
  }): Promise<string[]> {
    const { nameSingular } = flatObjectMetadata;

    const relationTargets =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const queryBuilder = this.workspaceOrmManager
          .getRepository(nameSingular)
          .createQueryBuilder(nameSingular);

        new CommonQueryParser({
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        }).applyFilterToBuilder({
          queryBuilder,
          objectNameSingular: nameSingular,
          recordFilter: filter,
        });

        return queryBuilder.setFindOptions({ select: { id: true } }).getMany();
      }, authContext);

    return relationTargets.length > 0
      ? relationTargets.map(({ id }) => id)
      : [DYNAMIC_FIELD_NO_MATCH_SENTINEL_ID];
  }
}
