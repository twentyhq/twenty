import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';
import { APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { IndexMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-metadata.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { filterMorphRelationDuplicateFieldsDTO } from 'src/engine/dataloaders/utils/filter-morph-relation-duplicate-fields.util';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataMorphRelationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-morph-relation.service';
import { FieldMetadataRelationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-relation.service';
import { fromFieldMetadataEntityToFieldMetadataDto } from 'src/engine/metadata-modules/field-metadata/utils/from-field-metadata-entity-to-field-metadata-dto.util';
import { resolveFieldMetadataStandardOverride } from 'src/engine/metadata-modules/field-metadata/utils/resolve-field-metadata-standard-override.util';
import { IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';

export type RelationMetadataLoaderPayload = {
  workspaceId: string;
  fieldMetadata: Pick<FieldMetadataEntity, 'type' | 'id' | 'objectMetadataId'>;
};

export type RelationLoaderPayload = {
  workspaceId: string;
  fieldMetadata: Pick<
    FieldMetadataEntity,
    | 'type'
    | 'id'
    | 'objectMetadataId'
    | 'relationTargetFieldMetadataId'
    | 'relationTargetObjectMetadataId'
  >;
};

export type MorphRelationLoaderPayload = {
  workspaceId: string;
  fieldMetadata: Pick<
    FieldMetadataEntity,
    | 'type'
    | 'id'
    | 'objectMetadataId'
    | 'relationTargetFieldMetadataId'
    | 'relationTargetObjectMetadataId'
    | 'name'
  >;
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

@Injectable()
export class DataloaderService {
  constructor(
    private readonly fieldMetadataRelationService: FieldMetadataRelationService,
    private readonly fieldMetadataMorphRelationService: FieldMetadataMorphRelationService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
  ) {}

  createLoaders(): IDataloaders {
    const relationLoader = this.createRelationLoader();
    const morphRelationLoader = this.createMorphRelationLoader();
    const fieldMetadataLoader = this.createFieldMetadataLoader();
    const indexMetadataLoader = this.createIndexMetadataLoader();
    const indexFieldMetadataLoader = this.createIndexFieldMetadataLoader();

    return {
      relationLoader,
      morphRelationLoader,
      fieldMetadataLoader,
      indexMetadataLoader,
      indexFieldMetadataLoader,
    };
  }

  private createRelationLoader() {
    return new DataLoader<
      RelationLoaderPayload,
      {
        sourceObjectMetadata: ObjectMetadataEntity;
        targetObjectMetadata: ObjectMetadataEntity;
        sourceFieldMetadata: FieldMetadataEntity;
        targetFieldMetadata: FieldMetadataEntity;
      }
    >(async (dataLoaderParams: RelationLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;
      const fieldMetadataItems = dataLoaderParams.map(
        (dataLoaderParam) => dataLoaderParam.fieldMetadata,
      );

      const fieldMetadataRelationCollection =
        await this.fieldMetadataRelationService.findCachedFieldMetadataRelation(
          fieldMetadataItems,
          workspaceId,
        );

      return fieldMetadataRelationCollection;
    });
  }

  private createMorphRelationLoader() {
    return new DataLoader<
      MorphRelationLoaderPayload,
      {
        sourceObjectMetadata: ObjectMetadataEntity;
        targetObjectMetadata: ObjectMetadataEntity;
        sourceFieldMetadata: FieldMetadataEntity;
        targetFieldMetadata: FieldMetadataEntity;
      }[]
    >(async (dataLoaderParams: MorphRelationLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;

      const fieldMetadataItems = dataLoaderParams.map(
        (dataLoaderParam) => dataLoaderParam.fieldMetadata,
      );

      const fieldMetadataMorphRelationCollection =
        await this.fieldMetadataMorphRelationService.findCachedFieldMetadataMorphRelation(
          fieldMetadataItems,
          workspaceId,
        );

      return fieldMetadataItems.map((fieldMetadataItem) => {
        return fieldMetadataMorphRelationCollection.filter(
          (fieldMetadataMorphRelation) =>
            fieldMetadataItem.name ===
            fieldMetadataMorphRelation.sourceFieldMetadata.name,
        );
      });
    });
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
        const workspaceId = dataLoaderParams[0].workspaceId;
        const objectMetadataIds = dataLoaderParams.map(
          (dataLoaderParam) => dataLoaderParam.objectMetadata.id,
        );

        const { objectMetadataMaps } =
          await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
            { workspaceId },
          );

        const fieldMetadataCollection = objectMetadataIds.map((id) => {
          const objectMetadata = objectMetadataMaps.byId[id];

          if (!isDefined(objectMetadata)) {
            return [];
          }

          const fields = Object.values(
            objectMetadata.fieldsById,
          ).map<FieldMetadataDTO>((fieldMetadata) => {
            const overridesFieldToCompute = [
              'icon',
              'label',
              'description',
            ] as const satisfies (keyof FieldMetadataEntity)[];

            const overrides = overridesFieldToCompute.reduce<
              Partial<Record<(typeof overridesFieldToCompute)[number], string>>
            >(
              (acc, field) => ({
                ...acc,
                [field]: resolveFieldMetadataStandardOverride(
                  {
                    label: fieldMetadata.label,
                    description: fieldMetadata.description ?? undefined,
                    icon: fieldMetadata.icon ?? undefined,
                    isCustom: fieldMetadata.isCustom,
                    standardOverrides:
                      fieldMetadata.standardOverrides ?? undefined,
                  },
                  field,
                  dataLoaderParams[0].locale,
                ),
              }),
              {},
            );

            return fromFieldMetadataEntityToFieldMetadataDto({
              ...fieldMetadata,
              ...overrides,
            });
          });

          return filterMorphRelationDuplicateFieldsDTO(fields);
        });

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
}
