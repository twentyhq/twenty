import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type IndexMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-metadata.interface';

import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { filterMorphRelationDuplicateFields } from 'src/engine/dataloaders/utils/filter-morph-relation-duplicate-fields.util';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-overridable-properties-by-metadata-name.constant';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { getTwentyStandardApplicationIdOrThrow } from 'src/engine/metadata-modules/utils/get-twenty-standard-application-id-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { resolveMorphRelationsFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-morph-relations-from-flat-field-metadata.util';
import { resolveRelationFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-relation-from-flat-field-metadata.util';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';
import { fromFlatSearchFieldMetadataToSearchFieldMetadataDto } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/from-flat-search-field-metadata-to-search-field-metadata-dto.util';
import { fromFlatViewFieldGroupToViewFieldGroupDto } from 'src/engine/metadata-modules/view-field-group/utils/from-flat-view-field-group-to-view-field-group-dto.util';
import { fromFlatViewFieldToViewFieldDto } from 'src/engine/metadata-modules/view-field/utils/from-flat-view-field-to-view-field-dto.util';
import { fromFlatViewFilterToViewFilterDto } from 'src/engine/metadata-modules/view-filter/utils/from-flat-view-filter-to-view-filter-dto.util';
import { fromFlatViewFilterGroupToViewFilterGroupDto } from 'src/engine/metadata-modules/view-filter-group/utils/from-flat-view-filter-group-to-view-filter-group-dto.util';
import { fromFlatViewGroupToViewGroupDto } from 'src/engine/metadata-modules/view-group/utils/from-flat-view-group-to-view-group-dto.util';
import { fromFlatViewSortToViewSortDto } from 'src/engine/metadata-modules/view-sort/utils/from-flat-view-sort-to-view-sort-dto.util';
import { type IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { type IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type SearchFieldMetadataDTO } from 'src/engine/metadata-modules/search-field-metadata/dtos/search-field-metadata.dto';

export type RelationMetadataLoaderPayload = {
  workspaceId: string;
  fieldMetadata: Pick<FieldMetadataEntity, 'type' | 'id' | 'objectMetadataId'>;
};

export type RelationLoaderPayload = {
  workspaceId: string;
  fieldMetadataId: string;
  objectMetadataId: string;
};

export type MorphRelationLoaderPayload = {
  workspaceId: string;
  fieldMetadataId: string;
  objectMetadataId: string;
};

export type FieldMetadataLoaderPayload = {
  workspaceId: string;
  objectMetadata: Pick<ObjectMetadataEntity, 'id'>;
  locale?: keyof typeof APP_LOCALES;
};

export type IndexMetadataLoaderPayload = {
  workspaceId: string;
  objectMetadata: Pick<ObjectMetadataEntity, 'id'>;
};

export type IndexFieldMetadataLoaderPayload = {
  workspaceId: string;
  objectMetadata: Pick<ObjectMetadataEntity, 'id'>;
  indexMetadata: Pick<IndexMetadataInterface, 'id'>;
};

export type SearchFieldMetadataLoaderPayload = {
  workspaceId: string;
  objectMetadata: Pick<ObjectMetadataEntity, 'id'>;
};

export type ObjectMetadataLoaderPayload = {
  workspaceId: string;
  objectMetadataId: string;
};

export type ViewFieldGroupsByViewIdLoaderPayload = {
  workspaceId: string;
  viewId: string;
};

export type ViewFieldsByViewFieldGroupIdLoaderPayload = {
  workspaceId: string;
  viewFieldGroupId: string;
};

export type ViewFieldsByViewIdLoaderPayload = {
  workspaceId: string;
  viewId: string;
};

export type ViewFiltersByViewIdLoaderPayload = {
  workspaceId: string;
  viewId: string;
};

export type ViewSortsByViewIdLoaderPayload = {
  workspaceId: string;
  viewId: string;
};

export type ViewGroupsByViewIdLoaderPayload = {
  workspaceId: string;
  viewId: string;
};

export type ViewFilterGroupsByViewIdLoaderPayload = {
  workspaceId: string;
  viewId: string;
};

export type IsConfiguredLoaderPayload = {
  applicationRegistrationId: string;
};

export type StandardApplicationIdLoaderPayload = {
  workspaceId: string;
};

export type ApplicationTranslationCatalogLoaderPayload = {
  applicationId: string;
  workspaceId: string;
  locale: keyof typeof APP_LOCALES;
};

@Injectable()
export class DataloaderService {
  constructor(
    private readonly i18nService: I18nService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    private readonly applicationTranslationCacheService: ApplicationTranslationCacheService,
  ) {}

  createLoaders(): IDataloaders {
    const relationLoader = this.createRelationLoader();
    const morphRelationLoader = this.createMorphRelationLoader();
    const fieldMetadataLoader = this.createFieldMetadataLoader();
    const indexMetadataLoader = this.createIndexMetadataLoader();
    const indexFieldMetadataLoader = this.createIndexFieldMetadataLoader();
    const searchFieldMetadataLoader = this.createSearchFieldMetadataLoader();
    const objectMetadataLoader = this.createObjectMetadataLoader();
    const viewFieldGroupsByViewIdLoader =
      this.createViewFieldGroupsByViewIdLoader();
    const viewFieldsByViewFieldGroupIdLoader =
      this.createViewFieldsByViewFieldGroupIdLoader();
    const viewFieldsByViewIdLoader = this.createViewFieldsByViewIdLoader();
    const viewFiltersByViewIdLoader = this.createViewFiltersByViewIdLoader();
    const viewSortsByViewIdLoader = this.createViewSortsByViewIdLoader();
    const viewGroupsByViewIdLoader = this.createViewGroupsByViewIdLoader();
    const viewFilterGroupsByViewIdLoader =
      this.createViewFilterGroupsByViewIdLoader();
    const isConfiguredLoader = this.createIsConfiguredLoader();
    const standardApplicationIdLoader =
      this.createStandardApplicationIdLoader();
    const applicationTranslationCatalogLoader =
      this.createApplicationTranslationCatalogLoader();

    return {
      relationLoader,
      morphRelationLoader,
      fieldMetadataLoader,
      indexMetadataLoader,
      indexFieldMetadataLoader,
      searchFieldMetadataLoader,
      objectMetadataLoader,
      viewFieldGroupsByViewIdLoader,
      viewFieldsByViewFieldGroupIdLoader,
      viewFieldsByViewIdLoader,
      viewFiltersByViewIdLoader,
      viewSortsByViewIdLoader,
      viewGroupsByViewIdLoader,
      viewFilterGroupsByViewIdLoader,
      isConfiguredLoader,
      standardApplicationIdLoader,
      applicationTranslationCatalogLoader,
    };
  }

  private createRelationLoader() {
    return new DataLoader<RelationLoaderPayload, RelationDTO | null>(
      async (dataLoaderParams: RelationLoaderPayload[]) => {
        const workspaceId = dataLoaderParams[0].workspaceId;
        const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatMapsKeys: ['flatFieldMetadataMaps', 'flatObjectMetadataMaps'],
            },
          );

        return dataLoaderParams.map(({ fieldMetadataId }) => {
          const sourceFlatFieldMetadata =
            findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityId: fieldMetadataId,
              flatEntityMaps: flatFieldMetadataMaps,
            });

          if (
            !isFlatFieldMetadataOfType(
              sourceFlatFieldMetadata,
              FieldMetadataType.RELATION,
            )
          ) {
            return null;
          }

          return resolveRelationFromFlatFieldMetadata({
            sourceFlatFieldMetadata,
            flatFieldMetadataMaps,
            flatObjectMetadataMaps,
          });
        });
      },
    );
  }

  private createMorphRelationLoader() {
    return new DataLoader<MorphRelationLoaderPayload, RelationDTO[] | null>(
      async (dataLoaderParams: MorphRelationLoaderPayload[]) => {
        const workspaceId = dataLoaderParams[0].workspaceId;
        const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatMapsKeys: ['flatFieldMetadataMaps', 'flatObjectMetadataMaps'],
            },
          );

        return dataLoaderParams.map(({ fieldMetadataId }) => {
          const morphFlatFieldMetadata =
            findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityId: fieldMetadataId,
              flatEntityMaps: flatFieldMetadataMaps,
            });

          if (
            !isFlatFieldMetadataOfType(
              morphFlatFieldMetadata,
              FieldMetadataType.MORPH_RELATION,
            )
          ) {
            return null;
          }

          return resolveMorphRelationsFromFlatFieldMetadata({
            morphFlatFieldMetadata,
            flatFieldMetadataMaps,
            flatObjectMetadataMaps,
          });
        });
      },
    );
  }

  private createIndexMetadataLoader() {
    return new DataLoader<IndexMetadataLoaderPayload, IndexMetadataDTO[]>(
      async (dataLoaderParams: IndexMetadataLoaderPayload[]) => {
        const workspaceId = dataLoaderParams[0].workspaceId;
        const objectMetadataIds = dataLoaderParams.map(
          (dataLoaderParam) => dataLoaderParam.objectMetadata.id,
        );

        const { flatIndexMaps, flatObjectMetadataMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatMapsKeys: ['flatIndexMaps', 'flatObjectMetadataMaps'],
            },
          );

        const indexMetadataCollection = objectMetadataIds.map(
          (objectMetadataId) => {
            const flatObjectMetadata =
              findFlatEntityByIdInFlatEntityMapsOrThrow({
                flatEntityId: objectMetadataId,
                flatEntityMaps: flatObjectMetadataMaps,
              });

            const indexMetadatas =
              findManyFlatEntityByIdInFlatEntityMapsOrThrow({
                flatEntityIds: flatObjectMetadata.indexMetadataIds,
                flatEntityMaps: flatIndexMaps,
              });

            return indexMetadatas.map((indexMetadata) => ({
              ...indexMetadata,
              indexFieldMetadatas: indexMetadata.flatIndexFieldMetadatas,
              createdAt: new Date(indexMetadata.createdAt),
              updatedAt: new Date(indexMetadata.updatedAt),
              id: indexMetadata.id,
              indexWhereClause: indexMetadata.indexWhereClause ?? undefined,
              objectMetadataId,
              workspaceId,
            }));
          },
        );

        return indexMetadataCollection;
      },
    );
  }

  private createSearchFieldMetadataLoader() {
    return new DataLoader<
      SearchFieldMetadataLoaderPayload,
      SearchFieldMetadataDTO[]
    >(async (dataLoaderParams: SearchFieldMetadataLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;
      const objectMetadataIds = dataLoaderParams.map(
        (dataLoaderParam) => dataLoaderParam.objectMetadata.id,
      );

      const { flatSearchFieldMetadataMaps, flatObjectMetadataMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: [
              'flatSearchFieldMetadataMaps',
              'flatObjectMetadataMaps',
            ],
          },
        );

      return objectMetadataIds.map((objectMetadataId) => {
        const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });

        const searchFieldMetadatas =
          findManyFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityIds: flatObjectMetadata.searchFieldMetadataIds,
            flatEntityMaps: flatSearchFieldMetadataMaps,
          });

        return searchFieldMetadatas.map(
          fromFlatSearchFieldMetadataToSearchFieldMetadataDto,
        );
      });
    });
  }

  private createFieldMetadataLoader() {
    return new DataLoader<FieldMetadataLoaderPayload, FieldMetadataDTO[]>(
      async (dataLoaderParams: FieldMetadataLoaderPayload[]) => {
        const locale = dataLoaderParams[0].locale;
        const safeLocale = locale ?? SOURCE_LOCALE;
        const i18nInstance = this.i18nService.getI18nInstance(safeLocale);
        const workspaceId = dataLoaderParams[0].workspaceId;
        const objectMetadataIds = dataLoaderParams.map(
          (dataLoaderParam) => dataLoaderParam.objectMetadata.id,
        );

        const {
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
          flatApplicationMaps,
        } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatMapsKeys: [
                'flatFieldMetadataMaps',
                'flatObjectMetadataMaps',
                'flatApplicationMaps',
              ],
            },
          );

        const objectFlatFieldMetadatasList = objectMetadataIds.map(
          (objectMetadataId) => {
            const flatObjectMetadata =
              findFlatEntityByIdInFlatEntityMapsOrThrow({
                flatEntityId: objectMetadataId,
                flatEntityMaps: flatObjectMetadataMaps,
              });

            return findManyFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityIds: flatObjectMetadata.fieldIds,
              flatEntityMaps: flatFieldMetadataMaps,
            });
          },
        );

        const applicationCatalogByRegistrationId =
          await this.loadApplicationCatalogByRegistrationId({
            applicationIds: objectFlatFieldMetadatasList
              .flat()
              .map((flatFieldMetadata) => flatFieldMetadata.applicationId),
            flatApplicationMaps,
            locale: safeLocale,
          });

        const fieldMetadataCollection = objectFlatFieldMetadatasList.map(
          (objectFlatFieldMetadatas) => {
            const overriddenFieldMetadataEntities =
              objectFlatFieldMetadatas.map((flatFieldMetadata) => {
                const applicationRegistrationId =
                  flatApplicationMaps.byId[flatFieldMetadata.applicationId]
                    ?.applicationRegistrationId;
                const applicationCatalog = isDefined(applicationRegistrationId)
                  ? applicationCatalogByRegistrationId.get(
                      applicationRegistrationId,
                    )
                  : undefined;

                const overrides = flatFieldMetadata.overrides ?? undefined;
                const i18nContext = {
                  locale,
                  i18nInstance,
                  isStandardApp: belongsToTwentyStandardApp(flatFieldMetadata),
                  applicationCatalog,
                };

                return ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME.fieldMetadata.reduce(
                  (acc, property) => ({
                    ...acc,
                    [property]: resolveEffectiveEntityProperty({
                      metadataName: 'fieldMetadata',
                      baseValue: flatFieldMetadata[property],
                      overrides,
                      property,
                      i18nContext,
                    }),
                  }),
                  flatFieldMetadata,
                );
              });

            const filteredFieldMetadataEntities =
              filterMorphRelationDuplicateFields(
                overriddenFieldMetadataEntities,
              );

            const filteredFieldMetadataEntitiesWithMorphRenamed =
              filteredFieldMetadataEntities.map((flatFieldMetadata) => {
                if (
                  isFlatFieldMetadataOfType(
                    flatFieldMetadata,
                    FieldMetadataType.MORPH_RELATION,
                  )
                ) {
                  const relationTargetObjectMetadata =
                    findFlatEntityByIdInFlatEntityMapsOrThrow({
                      flatEntityId:
                        flatFieldMetadata.relationTargetObjectMetadataId,
                      flatEntityMaps: flatObjectMetadataMaps,
                    });

                  return {
                    ...flatFieldMetadata,
                    name: getMorphNameFromMorphFieldMetadataName({
                      morphRelationFlatFieldMetadata: flatFieldMetadata,
                      nameSingular: relationTargetObjectMetadata.nameSingular,
                      namePlural: relationTargetObjectMetadata.namePlural,
                    }),
                  };
                }

                return flatFieldMetadata;
              });

            return filteredFieldMetadataEntitiesWithMorphRenamed.map(
              fromFlatFieldMetadataToFieldMetadataDto,
            );
          },
        );

        return fieldMetadataCollection;
      },
    );
  }

  private createIndexFieldMetadataLoader() {
    return new DataLoader<
      IndexFieldMetadataLoaderPayload,
      IndexFieldMetadataDTO[]
    >(async (dataLoaderParams: IndexFieldMetadataLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;

      const { flatIndexMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatIndexMaps'],
          },
        );

      return dataLoaderParams.map(
        ({ indexMetadata: { id: indexMetadataId } }) => {
          const indexMetadataEntity = findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: indexMetadataId,
            flatEntityMaps: flatIndexMaps,
          });

          if (!isDefined(indexMetadataEntity)) {
            return [];
          }

          return [...indexMetadataEntity.flatIndexFieldMetadatas]
            .sort((a, b) => a.order - b.order)
            .map((indexFieldMetadata) => {
              return {
                id: indexFieldMetadata.id,
                fieldMetadataId: indexFieldMetadata.fieldMetadataId,
                subFieldName: indexFieldMetadata.subFieldName ?? undefined,
                order: indexFieldMetadata.order,
                createdAt: new Date(indexFieldMetadata.createdAt),
                updatedAt: new Date(indexFieldMetadata.updatedAt),
                indexMetadataId,
                workspaceId,
              };
            });
        },
      );
    });
  }

  private createObjectMetadataLoader() {
    return new DataLoader<
      ObjectMetadataLoaderPayload,
      ObjectMetadataDTO | null
    >(async (dataLoaderParams: ObjectMetadataLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;

      const { flatObjectMetadataMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatObjectMetadataMaps'],
          },
        );

      return dataLoaderParams.map((dataLoaderParam) => {
        const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: dataLoaderParam.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });

        if (!isDefined(flatObjectMetadata)) {
          return null;
        }

        return fromFlatObjectMetadataToObjectMetadataDto(flatObjectMetadata);
      });
    });
  }

  private createViewFieldGroupsByViewIdLoader() {
    return new DataLoader<
      ViewFieldGroupsByViewIdLoaderPayload,
      ReturnType<typeof fromFlatViewFieldGroupToViewFieldGroupDto>[]
    >(async (dataLoaderParams: ViewFieldGroupsByViewIdLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;

      const { flatViewMaps, flatViewFieldGroupMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatViewMaps', 'flatViewFieldGroupMaps'],
          },
        );

      return dataLoaderParams.map(({ viewId }) => {
        const flatView = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: viewId,
          flatEntityMaps: flatViewMaps,
        });

        if (!isDefined(flatView)) {
          return [];
        }

        return findManyFlatEntityByIdInFlatEntityMaps({
          flatEntityIds: flatView.viewFieldGroupIds,
          flatEntityMaps: flatViewFieldGroupMaps,
        })
          .filter(
            (flatViewFieldGroup) =>
              flatViewFieldGroup.deletedAt === null &&
              flatViewFieldGroup.isActive,
          )
          .map(fromFlatViewFieldGroupToViewFieldGroupDto);
      });
    });
  }

  private createViewFieldsByViewFieldGroupIdLoader() {
    return new DataLoader<
      ViewFieldsByViewFieldGroupIdLoaderPayload,
      ReturnType<typeof fromFlatViewFieldToViewFieldDto>[]
    >(async (dataLoaderParams: ViewFieldsByViewFieldGroupIdLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;

      const { flatViewFieldGroupMaps, flatViewFieldMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatViewFieldGroupMaps', 'flatViewFieldMaps'],
          },
        );

      const viewFieldsByResolvedGroupId = new Map<
        string,
        ReturnType<typeof fromFlatViewFieldToViewFieldDto>[]
      >();

      for (const flatViewField of Object.values(
        flatViewFieldMaps.byUniversalIdentifier,
      )) {
        if (
          !isDefined(flatViewField) ||
          flatViewField.deletedAt !== null ||
          !flatViewField.isActive
        ) {
          continue;
        }

        const resolvedGroupId =
          flatViewField.overrides?.viewFieldGroupId !== undefined
            ? flatViewField.overrides.viewFieldGroupId
            : flatViewField.viewFieldGroupId;

        if (!isDefined(resolvedGroupId)) {
          continue;
        }

        if (!viewFieldsByResolvedGroupId.has(resolvedGroupId)) {
          viewFieldsByResolvedGroupId.set(resolvedGroupId, []);
        }

        viewFieldsByResolvedGroupId
          .get(resolvedGroupId)!
          .push(fromFlatViewFieldToViewFieldDto(flatViewField));
      }

      return dataLoaderParams.map(({ viewFieldGroupId }) => {
        const flatViewFieldGroup = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: viewFieldGroupId,
          flatEntityMaps: flatViewFieldGroupMaps,
        });

        if (!isDefined(flatViewFieldGroup)) {
          return [];
        }

        return viewFieldsByResolvedGroupId.get(viewFieldGroupId) ?? [];
      });
    });
  }

  private createViewFieldsByViewIdLoader() {
    return new DataLoader<
      ViewFieldsByViewIdLoaderPayload,
      ReturnType<typeof fromFlatViewFieldToViewFieldDto>[]
    >(async (dataLoaderParams: ViewFieldsByViewIdLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;

      const { flatViewMaps, flatViewFieldMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatViewMaps', 'flatViewFieldMaps'],
          },
        );

      return dataLoaderParams.map(({ viewId }) => {
        const flatView = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: viewId,
          flatEntityMaps: flatViewMaps,
        });

        if (!isDefined(flatView)) {
          return [];
        }

        return findManyFlatEntityByIdInFlatEntityMaps({
          flatEntityIds: flatView.viewFieldIds,
          flatEntityMaps: flatViewFieldMaps,
        })
          .filter(
            (flatViewField) =>
              flatViewField.deletedAt === null && flatViewField.isActive,
          )
          .map(fromFlatViewFieldToViewFieldDto);
      });
    });
  }

  private createViewFiltersByViewIdLoader() {
    return new DataLoader<
      ViewFiltersByViewIdLoaderPayload,
      ReturnType<typeof fromFlatViewFilterToViewFilterDto>[]
    >(async (dataLoaderParams: ViewFiltersByViewIdLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;

      const { flatViewMaps, flatViewFilterMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatViewMaps', 'flatViewFilterMaps'],
          },
        );

      return dataLoaderParams.map(({ viewId }) => {
        const flatView = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: viewId,
          flatEntityMaps: flatViewMaps,
        });

        if (!isDefined(flatView)) {
          return [];
        }

        return findManyFlatEntityByIdInFlatEntityMaps({
          flatEntityIds: flatView.viewFilterIds,
          flatEntityMaps: flatViewFilterMaps,
        })
          .filter((flatViewFilter) => flatViewFilter.deletedAt === null)
          .map(fromFlatViewFilterToViewFilterDto);
      });
    });
  }

  private createViewSortsByViewIdLoader() {
    return new DataLoader<
      ViewSortsByViewIdLoaderPayload,
      ReturnType<typeof fromFlatViewSortToViewSortDto>[]
    >(async (dataLoaderParams: ViewSortsByViewIdLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;

      const { flatViewMaps, flatViewSortMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatViewMaps', 'flatViewSortMaps'],
          },
        );

      return dataLoaderParams.map(({ viewId }) => {
        const flatView = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: viewId,
          flatEntityMaps: flatViewMaps,
        });

        if (!isDefined(flatView)) {
          return [];
        }

        return findManyFlatEntityByIdInFlatEntityMaps({
          flatEntityIds: flatView.viewSortIds,
          flatEntityMaps: flatViewSortMaps,
        })
          .filter((flatViewSort) => flatViewSort.deletedAt === null)
          .map(fromFlatViewSortToViewSortDto);
      });
    });
  }

  private createViewGroupsByViewIdLoader() {
    return new DataLoader<
      ViewGroupsByViewIdLoaderPayload,
      ReturnType<typeof fromFlatViewGroupToViewGroupDto>[]
    >(async (dataLoaderParams: ViewGroupsByViewIdLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;

      const { flatViewMaps, flatViewGroupMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatViewMaps', 'flatViewGroupMaps'],
          },
        );

      return dataLoaderParams.map(({ viewId }) => {
        const flatView = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: viewId,
          flatEntityMaps: flatViewMaps,
        });

        if (!isDefined(flatView)) {
          return [];
        }

        return findManyFlatEntityByIdInFlatEntityMaps({
          flatEntityIds: flatView.viewGroupIds,
          flatEntityMaps: flatViewGroupMaps,
        })
          .filter((flatViewGroup) => flatViewGroup.deletedAt === null)
          .map(fromFlatViewGroupToViewGroupDto);
      });
    });
  }

  private createViewFilterGroupsByViewIdLoader() {
    return new DataLoader<
      ViewFilterGroupsByViewIdLoaderPayload,
      ReturnType<typeof fromFlatViewFilterGroupToViewFilterGroupDto>[]
    >(async (dataLoaderParams: ViewFilterGroupsByViewIdLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;

      const { flatViewMaps, flatViewFilterGroupMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatViewMaps', 'flatViewFilterGroupMaps'],
          },
        );

      return dataLoaderParams.map(({ viewId }) => {
        const flatView = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: viewId,
          flatEntityMaps: flatViewMaps,
        });

        if (!isDefined(flatView)) {
          return [];
        }

        return findManyFlatEntityByIdInFlatEntityMaps({
          flatEntityIds: flatView.viewFilterGroupIds,
          flatEntityMaps: flatViewFilterGroupMaps,
        })
          .filter(
            (flatViewFilterGroup) => flatViewFilterGroup.deletedAt === null,
          )
          .map(fromFlatViewFilterGroupToViewFilterGroupDto);
      });
    });
  }

  private createIsConfiguredLoader() {
    return new DataLoader<IsConfiguredLoaderPayload, boolean>(
      async (params: IsConfiguredLoaderPayload[]) => {
        const ids = params.map((p) => p.applicationRegistrationId);

        const resultMap =
          await this.applicationRegistrationVariableService.isConfiguredBatch(
            ids,
          );

        return params.map(
          (p) => resultMap.get(p.applicationRegistrationId) ?? true,
        );
      },
    );
  }

  private createStandardApplicationIdLoader() {
    return new DataLoader<StandardApplicationIdLoaderPayload, string>(
      async (params: StandardApplicationIdLoaderPayload[]) => {
        const workspaceId = params[0].workspaceId;

        const { flatApplicationMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatMapsKeys: ['flatApplicationMaps'],
            },
          );

        const standardApplicationId =
          getTwentyStandardApplicationIdOrThrow(flatApplicationMaps);

        return params.map(() => standardApplicationId);
      },
    );
  }

  private createApplicationTranslationCatalogLoader() {
    return new DataLoader<
      ApplicationTranslationCatalogLoaderPayload,
      Record<string, string> | undefined
    >(async (params: ApplicationTranslationCatalogLoaderPayload[]) => {
      const workspaceId = params[0].workspaceId;
      const locale = params[0].locale;

      const { flatApplicationMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatApplicationMaps'],
          },
        );

      const standardApplicationId =
        getTwentyStandardApplicationIdOrThrow(flatApplicationMaps);

      const catalogByRegistrationId =
        await this.loadApplicationCatalogByRegistrationId({
          applicationIds: params.map((param) => param.applicationId),
          flatApplicationMaps,
          locale,
        });

      return params.map((param) => {
        if (param.applicationId === standardApplicationId) {
          return undefined;
        }

        const applicationRegistrationId =
          flatApplicationMaps.byId[param.applicationId]
            ?.applicationRegistrationId;

        return isDefined(applicationRegistrationId)
          ? catalogByRegistrationId.get(applicationRegistrationId)
          : undefined;
      });
    });
  }

  private async loadApplicationCatalogByRegistrationId({
    applicationIds,
    flatApplicationMaps,
    locale,
  }: {
    applicationIds: string[];
    flatApplicationMaps: FlatApplicationCacheMaps;
    locale: keyof typeof APP_LOCALES;
  }): Promise<Map<string, Record<string, string>>> {
    const registrationIds = [
      ...new Set(
        applicationIds
          .map(
            (applicationId) =>
              flatApplicationMaps.byId[applicationId]
                ?.applicationRegistrationId,
          )
          .filter(isDefined),
      ),
    ];

    const catalogByRegistrationId = new Map<string, Record<string, string>>();

    await Promise.all(
      registrationIds.map(async (applicationRegistrationId) => {
        const catalog =
          await this.applicationTranslationCacheService.getCatalog({
            applicationRegistrationId,
            locale,
          });

        catalogByRegistrationId.set(applicationRegistrationId, catalog);
      }),
    );

    return catalogByRegistrationId;
  }
}
