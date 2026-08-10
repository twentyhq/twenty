import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { loadApplicationCatalogsByRegistrationId } from 'src/engine/dataloaders/utils/load-application-catalogs-by-registration-id.util';
import {
  FIELD_FILTER_COLUMN_BY_FILTER_FIELD,
  type FieldFilterInput,
} from 'src/engine/metadata-modules/field-metadata/dtos/field-filter.input';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-overridable-properties-by-metadata-name.constant';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type CursorConnection } from 'src/engine/metadata-modules/pagination/dtos/cursor-connection-type.factory';
import { type CursorPagingInput } from 'src/engine/metadata-modules/pagination/dtos/cursor-paging.input';
import { applyMetadataFilterToItems } from 'src/engine/metadata-modules/pagination/utils/apply-metadata-filter-to-query-builder.util';
import { findManyItemsWithCursorPagination } from 'src/engine/metadata-modules/pagination/utils/find-many-items-with-cursor-pagination.util';
import { filterMorphRelationDuplicateFields } from 'src/engine/dataloaders/utils/filter-morph-relation-duplicate-fields.util';

export type FieldMetadataConnectionLoaderPayload = {
  workspaceId: string;
  objectMetadata: Pick<ObjectMetadataEntity, 'id'>;
  locale?: keyof typeof APP_LOCALES;
  filter: FieldFilterInput;
  paging: CursorPagingInput;
};

@Injectable()
export class FieldMetadataConnectionLoaderFactory {
  constructor(
    private readonly i18nService: I18nService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationTranslationCacheService: ApplicationTranslationCacheService,
  ) {}

  create(): DataLoader<
    FieldMetadataConnectionLoaderPayload,
    CursorConnection<FieldMetadataDTO>
  > {
    return new DataLoader<
      FieldMetadataConnectionLoaderPayload,
      CursorConnection<FieldMetadataDTO>
    >(async (dataLoaderParams: FieldMetadataConnectionLoaderPayload[]) => {
      const locale = dataLoaderParams[0].locale;
      const safeLocale = locale ?? SOURCE_LOCALE;
      const i18nInstance = this.i18nService.getI18nInstance(safeLocale);
      const workspaceId = dataLoaderParams[0].workspaceId;
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

      const connections = dataLoaderParams.map(
        ({ objectMetadata, paging, filter }) => {
          const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: objectMetadata.id,
            flatEntityMaps: flatObjectMetadataMaps,
          });
          const flatFieldMetadatas =
            findManyFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityIds: flatObjectMetadata.fieldIds,
              flatEntityMaps: flatFieldMetadataMaps,
            });
          const filteredFlatFieldMetadatas = applyMetadataFilterToItems({
            items: filterMorphRelationDuplicateFields(flatFieldMetadatas),
            filter,
            columnByFilterField: FIELD_FILTER_COLUMN_BY_FILTER_FIELD,
          });

          return findManyItemsWithCursorPagination({
            items: filteredFlatFieldMetadatas,
            paging,
          });
        },
      );
      const selectedFlatFieldMetadatas = connections.flatMap((connection) =>
        connection.edges.map(({ node }) => node),
      );
      const applicationCatalogByRegistrationId =
        await loadApplicationCatalogsByRegistrationId({
          applicationIds: selectedFlatFieldMetadatas.map(
            (flatFieldMetadata) => flatFieldMetadata.applicationId,
          ),
          flatApplicationMaps,
          locale: safeLocale,
          applicationTranslationCacheService:
            this.applicationTranslationCacheService,
        });

      return connections.map((connection) => ({
        ...connection,
        edges: connection.edges.map((edge) => {
          const flatFieldMetadata = edge.node;
          const applicationRegistrationId =
            flatApplicationMaps.byId[flatFieldMetadata.applicationId]
              ?.applicationRegistrationId;
          const applicationCatalog = isDefined(applicationRegistrationId)
            ? applicationCatalogByRegistrationId.get(applicationRegistrationId)
            : undefined;
          const overrides = flatFieldMetadata.overrides ?? undefined;
          const i18nContext = {
            locale,
            i18nInstance,
            isStandardApp: belongsToTwentyStandardApp(flatFieldMetadata),
            applicationCatalog,
          };
          const overriddenFlatFieldMetadata =
            ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME.fieldMetadata.reduce(
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
          let renamedFlatFieldMetadata = overriddenFlatFieldMetadata;

          if (
            isFlatFieldMetadataOfType(
              overriddenFlatFieldMetadata,
              FieldMetadataType.MORPH_RELATION,
            )
          ) {
            const relationTargetObjectMetadata =
              findFlatEntityByIdInFlatEntityMapsOrThrow({
                flatEntityId:
                  overriddenFlatFieldMetadata.relationTargetObjectMetadataId,
                flatEntityMaps: flatObjectMetadataMaps,
              });

            renamedFlatFieldMetadata = {
              ...overriddenFlatFieldMetadata,
              name: getMorphNameFromMorphFieldMetadataName({
                morphRelationFlatFieldMetadata: overriddenFlatFieldMetadata,
                nameSingular: relationTargetObjectMetadata.nameSingular,
                namePlural: relationTargetObjectMetadata.namePlural,
              }),
            };
          }

          return {
            ...edge,
            node: fromFlatFieldMetadataToFieldMetadataDto(
              renamedFlatFieldMetadata,
            ),
          };
        }),
      }));
    });
  }
}
