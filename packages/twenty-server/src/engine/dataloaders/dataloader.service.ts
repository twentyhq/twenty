import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type IndexMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-metadata.interface';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { filterMorphRelationDuplicateFields } from 'src/engine/dataloaders/utils/filter-morph-relation-duplicate-fields.util';
import { FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES } from 'src/engine/metadata-modules/field-metadata/constants/field-metadata-standard-overrides-properties.constant';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { resolveFieldMetadataStandardOverride } from 'src/engine/metadata-modules/field-metadata/utils/resolve-field-metadata-standard-override.util';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { findObjectFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-object-fields-in-flat-field-metadata-maps-or-throw.util';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { fromMorphOrRelationFlatFieldMetadataToRelationDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-morph-or-relation-flat-field-metadata-to-relation-dto.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { type IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';

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

export type ObjectMetadataLoaderPayload = {
  workspaceId: string;
  objectMetadataId: string;
};

@Injectable()
export class DataloaderService {
  constructor(
    private readonly i18nService: I18nService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
  ) {}

  createLoaders(): IDataloaders {
    const relationLoader = this.createRelationLoader();
    const morphRelationLoader = this.createMorphRelationLoader();
    const fieldMetadataLoader = this.createFieldMetadataLoader();
    const indexMetadataLoader = this.createIndexMetadataLoader();
    const indexFieldMetadataLoader = this.createIndexFieldMetadataLoader();
    const objectMetadataLoader = this.createObjectMetadataLoader();

    return {
      relationLoader,
      morphRelationLoader,
      fieldMetadataLoader,
      indexMetadataLoader,
      indexFieldMetadataLoader,
      objectMetadataLoader,
    };
  }

  private createRelationLoader() {
    return new DataLoader<RelationLoaderPayload, RelationDTO | null>(
      async (dataLoaderParams: RelationLoaderPayload[]) => {
        const relationDtos: Array<RelationDTO | null> = [];
        const workspaceId = dataLoaderParams[0].workspaceId;
        const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatEntities: ['flatFieldMetadataMaps', 'flatObjectMetadataMaps'],
            },
          );

        for (const { fieldMetadataId } of dataLoaderParams) {
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
            relationDtos.push(null);
            continue;
          }

          const sourceFlatObjectMetadata =
            findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityId: sourceFlatFieldMetadata.objectMetadataId,
              flatEntityMaps: flatObjectMetadataMaps,
            });

          const targetFlatFieldMetadata =
            findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityId:
                sourceFlatFieldMetadata.relationTargetFieldMetadataId,
              flatEntityMaps: flatFieldMetadataMaps,
            });

          if (!isMorphOrRelationFlatFieldMetadata(targetFlatFieldMetadata)) {
            relationDtos.push(null);
            continue;
          }

          const targetFlatObjectMetadata =
            findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityId: targetFlatFieldMetadata.objectMetadataId,
              flatEntityMaps: flatObjectMetadataMaps,
            });

          if (
            isFlatFieldMetadataOfType(
              targetFlatFieldMetadata,
              FieldMetadataType.MORPH_RELATION,
            )
          ) {
            const allMorphFlatFieldMetadatas =
              findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
                flatFieldMetadata: targetFlatFieldMetadata,
                flatFieldMetadataMaps,
                flatObjectMetadata: targetFlatObjectMetadata,
              }).sort((a, b) => (a.id > b.id ? 1 : -1));

            relationDtos.push(
              fromMorphOrRelationFlatFieldMetadataToRelationDto({
                sourceFlatFieldMetadata,
                sourceFlatObjectMetadata,
                targetFlatFieldMetadata: allMorphFlatFieldMetadatas[0],
                targetFlatObjectMetadata,
              }),
            );
            continue;
          }

          relationDtos.push(
            fromMorphOrRelationFlatFieldMetadataToRelationDto({
              sourceFlatFieldMetadata,
              targetFlatFieldMetadata,
              targetFlatObjectMetadata,
              sourceFlatObjectMetadata,
            }),
          );
        }

        return relationDtos;
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
              flatEntities: ['flatFieldMetadataMaps', 'flatObjectMetadataMaps'],
            },
          );
        const relationDtos: Array<RelationDTO[] | null> = [];

        for (const { fieldMetadataId } of dataLoaderParams) {
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
            relationDtos.push(null);
            continue;
          }

          const sourceFlatObjectMetadata =
            findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityMaps: flatObjectMetadataMaps,
              flatEntityId: morphFlatFieldMetadata.objectMetadataId,
            });

          const relatedMorphFlatFieldMetadatas =
            findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
              flatFieldMetadata: morphFlatFieldMetadata,
              flatFieldMetadataMaps,
              flatObjectMetadata: sourceFlatObjectMetadata,
            });
          const allMorphFlatFieldMetadatas = [
            morphFlatFieldMetadata,
            ...relatedMorphFlatFieldMetadatas,
          ];

          relationDtos.push(
            allMorphFlatFieldMetadatas.flatMap((sourceFlatFieldMetadata) => {
              const targetFlatFieldMetadata =
                findFlatEntityByIdInFlatEntityMapsOrThrow({
                  flatEntityId:
                    sourceFlatFieldMetadata.relationTargetFieldMetadataId,
                  flatEntityMaps: flatFieldMetadataMaps,
                });

              if (
                !isMorphOrRelationFlatFieldMetadata(targetFlatFieldMetadata)
              ) {
                return [];
              }

              const targetFlatObjectMetadata =
                findFlatEntityByIdInFlatEntityMapsOrThrow({
                  flatEntityId:
                    sourceFlatFieldMetadata.relationTargetObjectMetadataId,
                  flatEntityMaps: flatObjectMetadataMaps,
                });

              return fromMorphOrRelationFlatFieldMetadataToRelationDto({
                sourceFlatFieldMetadata,
                targetFlatFieldMetadata,
                targetFlatObjectMetadata,
                sourceFlatObjectMetadata,
              });
            }),
          );
        }

        return relationDtos;
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

        const { objectMetadataMaps } =
          await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
            { workspaceId },
          );

        const indexMetadataCollection = objectMetadataIds.map((id) => {
          const objectMetadata = objectMetadataMaps.byId[id];

          if (!isDefined(objectMetadata)) {
            return [];
          }

          return Object.values(objectMetadata.indexMetadatas).map(
            (indexMetadata) => {
              return {
                ...indexMetadata,
                createdAt: new Date(indexMetadata.createdAt),
                updatedAt: new Date(indexMetadata.updatedAt),
                id: indexMetadata.id,
                indexWhereClause: indexMetadata.indexWhereClause ?? undefined,
                objectMetadataId: id,
                workspaceId: workspaceId,
              };
            },
          );
        });

        return indexMetadataCollection;
      },
    );
  }

  private createFieldMetadataLoader() {
    return new DataLoader<FieldMetadataLoaderPayload, FieldMetadataDTO[]>(
      async (dataLoaderParams: FieldMetadataLoaderPayload[]) => {
        const locale = dataLoaderParams[0].locale;
        const i18nInstance = this.i18nService.getI18nInstance(
          locale ?? SOURCE_LOCALE,
        );
        const workspaceId = dataLoaderParams[0].workspaceId;
        const objectMetadataIds = dataLoaderParams.map(
          (dataLoaderParam) => dataLoaderParam.objectMetadata.id,
        );

        const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatEntities: ['flatFieldMetadataMaps', 'flatObjectMetadataMaps'],
            },
          );

        const fieldMetadataCollection = objectMetadataIds.map(
          (objectMetadataId) => {
            const flatObjectMetadata =
              findFlatEntityByIdInFlatEntityMapsOrThrow({
                flatEntityId: objectMetadataId,
                flatEntityMaps: flatObjectMetadataMaps,
              });
            const { objectFlatFieldMetadatas } =
              findObjectFlatFieldMetadatasOrThrow({
                flatFieldMetadataMaps: flatFieldMetadataMaps,
                flatObjectMetadata,
              });

            const overriddenFieldMetadataEntities =
              objectFlatFieldMetadatas.map((flatFieldMetadata) => {
                return FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES.reduce(
                  (acc, property) => ({
                    ...acc,
                    [property]: resolveFieldMetadataStandardOverride(
                      {
                        label: flatFieldMetadata.label,
                        description: flatFieldMetadata.description ?? undefined,
                        icon: flatFieldMetadata.icon ?? undefined,
                        isCustom: flatFieldMetadata.isCustom,
                        standardOverrides:
                          flatFieldMetadata.standardOverrides ?? undefined,
                      },
                      property,
                      dataLoaderParams[0].locale,
                      i18nInstance,
                    ),
                  }),
                  flatFieldMetadata,
                );
              });

            const filteredFieldMetadataEntities =
              filterMorphRelationDuplicateFields(
                overriddenFieldMetadataEntities,
              );

            return filteredFieldMetadataEntities.map(
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

      const { objectMetadataMaps } =
        await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
          { workspaceId },
        );

      return dataLoaderParams.map(
        ({
          objectMetadata: { id: objectMetadataId },
          indexMetadata: { id: indexMetadataId },
        }) => {
          const objectMetadata = objectMetadataMaps.byId[objectMetadataId];

          if (!isDefined(objectMetadata)) {
            return [];
          }

          const indexMetadataEntity = objectMetadata.indexMetadatas.find(
            (indexMetadata) => indexMetadata.id === indexMetadataId,
          );

          if (!isDefined(indexMetadataEntity)) {
            return [];
          }

          return indexMetadataEntity.indexFieldMetadatas.map(
            (indexFieldMetadata) => {
              return {
                id: indexFieldMetadata.id,
                fieldMetadataId: indexFieldMetadata.fieldMetadataId,
                order: indexFieldMetadata.order,
                createdAt: new Date(indexFieldMetadata.createdAt),
                updatedAt: new Date(indexFieldMetadata.updatedAt),
                indexMetadataId,
                workspaceId,
              };
            },
          );
        },
      );
    });
  }

  private createObjectMetadataLoader() {
    return new DataLoader<
      ObjectMetadataLoaderPayload,
      ObjectMetadataItemWithFieldMaps | null
    >(async (dataLoaderParams: ObjectMetadataLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;
      const objectMetadataIds = dataLoaderParams.map(
        (dataLoaderParam) => dataLoaderParam.objectMetadataId,
      );

      const { objectMetadataMaps } =
        await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
          { workspaceId },
        );

      return objectMetadataIds.map((objectMetadataId) => {
        return objectMetadataMaps.byId[objectMetadataId] || null;
      });
    });
  }
}
