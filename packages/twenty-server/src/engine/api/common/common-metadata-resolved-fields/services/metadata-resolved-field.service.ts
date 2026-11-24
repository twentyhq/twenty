import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { METADATA_RESOLVED_FIELD_NO_MATCH_SENTINEL_ID } from 'src/engine/api/common/common-metadata-resolved-fields/constants/metadata-resolved-field-no-match-sentinel-id.constant';
import { MetadataResolvedFieldResolverRegistry } from 'src/engine/api/common/common-metadata-resolved-fields/services/metadata-resolved-field-resolver.registry';
import { type MetadataResolvedFieldContextLoader } from 'src/engine/api/common/common-metadata-resolved-fields/types/metadata-resolved-field-context-loader.type';
import { type MetadataResolvedFieldFilter } from 'src/engine/api/common/common-metadata-resolved-fields/types/metadata-resolved-field-filter.type';
import { type MetadataResolvedFieldResolverInstance } from 'src/engine/api/common/common-metadata-resolved-fields/types/metadata-resolved-field-resolver-instance.type';
import { getMetadataResolvedFieldColumnNames } from 'src/engine/api/common/common-metadata-resolved-fields/utils/get-metadata-resolved-field-column-names.util';
import { mapMetadataResolvedFieldFilters } from 'src/engine/api/common/common-metadata-resolved-fields/utils/map-metadata-resolved-field-filters.util';
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

type MetadataResolvedFieldMetadataArgs = {
  authContext: WorkspaceAuthContext;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
};

@Injectable()
export class MetadataResolvedFieldService {
  constructor(
    private readonly metadataResolvedFieldResolverRegistry: MetadataResolvedFieldResolverRegistry,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  createContextLoader(workspaceId: string): MetadataResolvedFieldContextLoader {
    const loadingContextByMetadataResolvedFieldResolver = new Map<
      MetadataResolvedFieldResolverInstance,
      Promise<unknown>
    >();

    return (metadataResolvedFieldResolver) => {
      const loadingContext =
        loadingContextByMetadataResolvedFieldResolver.get(metadataResolvedFieldResolver) ??
        metadataResolvedFieldResolver.loadContext({ workspaceId });

      loadingContextByMetadataResolvedFieldResolver.set(
        metadataResolvedFieldResolver,
        loadingContext,
      );

      return loadingContext;
    };
  }

  async assignMetadataResolvedFieldValuesToRecords({
    loadContext,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    selection,
    records,
  }: Pick<
    MetadataResolvedFieldMetadataArgs,
    'flatObjectMetadata' | 'flatFieldMetadataMaps'
  > & {
    loadContext: MetadataResolvedFieldContextLoader;
    selection: CommonSelection;
    records: ObjectRecord[];
  }): Promise<void> {
    const selectedMetadataResolvedFieldColumnNames =
      this.getSelectedMetadataResolvedFieldColumnNames({
        selection,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

    if (selectedMetadataResolvedFieldColumnNames.length === 0 || records.length === 0) {
      return;
    }

    const metadataResolvedFieldResolver =
      this.metadataResolvedFieldResolverRegistry.findOrThrow(flatObjectMetadata);
    const context = await loadContext(metadataResolvedFieldResolver);

    for (const record of records) {
      const metadataResolvedFieldValues = metadataResolvedFieldResolver.computeValues({
        record,
        context,
      });

      for (const metadataResolvedFieldColumnName of selectedMetadataResolvedFieldColumnNames) {
        record[metadataResolvedFieldColumnName] =
          metadataResolvedFieldValues[metadataResolvedFieldColumnName] ?? null;
      }
    }
  }

  async prepareSelection({
    selection,
    ...metadataResolvedFieldMetadataArgs
  }: MetadataResolvedFieldMetadataArgs & {
    selection: CommonSelection;
  }): Promise<void> {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = metadataResolvedFieldMetadataArgs;

    if (
      this.getSelectedMetadataResolvedFieldColumnNames({
        selection,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      }).length > 0
    ) {
      for (const sourceColumnName of this.metadataResolvedFieldResolverRegistry.findOrThrow(
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
        relationSelection.filter = await this.rewriteMetadataResolvedFieldFilters({
          ...metadataResolvedFieldMetadataArgs,
          filter: relationSelection.filter,
          flatObjectMetadata: targetFlatObjectMetadata,
        });
      }

      await this.prepareSelection({
        ...metadataResolvedFieldMetadataArgs,
        selection: relationSelection.selection,
        flatObjectMetadata: targetFlatObjectMetadata,
      });
    }
  }

  async rewriteMetadataResolvedFieldFilters({
    filter,
    loadContext: providedLoadContext,
    ...metadataResolvedFieldMetadataArgs
  }: MetadataResolvedFieldMetadataArgs & {
    filter: ObjectRecordFilter;
    loadContext?: MetadataResolvedFieldContextLoader;
  }): Promise<ObjectRecordFilter> {
    const {
      authContext,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = metadataResolvedFieldMetadataArgs;
    const mapFilters = (
      mapMetadataResolvedFieldFilter: (
        metadataResolvedFieldFilter: MetadataResolvedFieldFilter,
      ) => ObjectRecordFilter | undefined,
    ) =>
      mapMetadataResolvedFieldFilters({
        filter,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        mapMetadataResolvedFieldFilter,
      });

    const metadataResolvedFieldFilters: MetadataResolvedFieldFilter[] = [];

    mapFilters((metadataResolvedFieldFilter) => {
      metadataResolvedFieldFilters.push(metadataResolvedFieldFilter);

      return undefined;
    });

    if (metadataResolvedFieldFilters.length === 0) {
      return filter;
    }

    const loadContext =
      providedLoadContext ?? this.createContextLoader(authContext.workspace.id);

    const sourceFilterByMetadataResolvedFieldFilter = new Map<
      Record<string, unknown>,
      ObjectRecordFilter
    >(
      await Promise.all(
        metadataResolvedFieldFilters.map(
          async ({
            flatObjectMetadata: metadataResolvedFieldFlatObjectMetadata,
            metadataResolvedFieldName,
            metadataResolvedFieldFilter,
            relationTargetFlatObjectMetadata,
          }) => {
            const metadataResolvedFieldResolver =
              this.metadataResolvedFieldResolverRegistry.findOrThrow(
                metadataResolvedFieldFlatObjectMetadata,
              );
            const context = await loadContext(metadataResolvedFieldResolver);
            const resolvedMetadataResolvedFieldFilter = isDefined(
              relationTargetFlatObjectMetadata,
            )
              ? {
                  in: await this.findMatchingRelationTargetIds({
                    ...metadataResolvedFieldMetadataArgs,
                    filter: metadataResolvedFieldFilter,
                    flatObjectMetadata: relationTargetFlatObjectMetadata,
                  }),
                }
              : metadataResolvedFieldFilter;

            return [
              metadataResolvedFieldFilter,
              this.computeSourceFilterOrThrow({
                metadataResolvedFieldResolver,
                metadataResolvedFieldName,
                metadataResolvedFieldFilter: resolvedMetadataResolvedFieldFilter,
                context,
              }),
            ] as const;
          },
        ),
      ),
    );

    return mapFilters(({ metadataResolvedFieldFilter }) =>
      sourceFilterByMetadataResolvedFieldFilter.get(metadataResolvedFieldFilter),
    );
  }

  private getSelectedMetadataResolvedFieldColumnNames({
    selection,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  }: Pick<
    MetadataResolvedFieldMetadataArgs,
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

    return getMetadataResolvedFieldColumnNames({
      flatObjectMetadata,
      flatFieldMetadataMaps,
    }).filter((metadataResolvedFieldColumnName) =>
      selectedColumnNames.has(metadataResolvedFieldColumnName),
    );
  }

  private computeSourceFilterOrThrow<TContext>({
    metadataResolvedFieldResolver,
    metadataResolvedFieldName,
    metadataResolvedFieldFilter,
    context,
  }: {
    metadataResolvedFieldResolver: MetadataResolvedFieldResolverInstance<TContext>;
    metadataResolvedFieldName: string;
    metadataResolvedFieldFilter: Record<string, unknown>;
    context: TContext;
  }): ObjectRecordFilter {
    try {
      return metadataResolvedFieldResolver.computeSourceFilter({
        metadataResolvedFieldName,
        metadataResolvedFieldFilter,
        context,
      });
    } catch {
      throw new CommonQueryRunnerException(
        `Filter ${JSON.stringify(metadataResolvedFieldFilter)} is not supported on metadata resolved field "${metadataResolvedFieldName}"`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`This filter is not supported on "${metadataResolvedFieldName}"`,
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
  }: MetadataResolvedFieldMetadataArgs & {
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
      : [METADATA_RESOLVED_FIELD_NO_MATCH_SENTINEL_ID];
  }
}
