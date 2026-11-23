import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import {
  capitalize,
  isDefined,
  isMorphRelationHead,
} from 'twenty-shared/utils';

import {
  type CommonSelectedFields,
  type CommonSelectedFieldsResult,
  type CommonSelectedRelation,
} from 'src/engine/api/common/types/common-selected-fields-result.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { CommonQuerySelectedFieldsAggregateParser } from 'src/engine/api/common/common-query-parsers/common-query-selected-fields/common-selected-fields-aggregate.parser';
import { CommonQuerySelectedFieldsRelationParser } from 'src/engine/api/common/common-query-parsers/common-query-selected-fields/common-selected-fields-relation.parser';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const isFieldSelected = ({
  selectedFields,
  fieldName,
}: {
  selectedFields: Pick<CommonSelectedFields, 'fields'>;
  fieldName: string;
}): boolean =>
  Object.prototype.hasOwnProperty.call(selectedFields.fields, fieldName);

export class CommonQuerySelectedFieldsParser {
  private commonQuerySelectedFieldsRelationParser: CommonQuerySelectedFieldsRelationParser;
  private aggregateParser: CommonQuerySelectedFieldsAggregateParser;
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;

  constructor({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }) {
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;
    this.commonQuerySelectedFieldsRelationParser =
      new CommonQuerySelectedFieldsRelationParser({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });
    this.aggregateParser = new CommonQuerySelectedFieldsAggregateParser();
  }

  parse({
    selectedFields,
    flatObjectMetadata,
    isFromOneToManyRelation,
  }: {
    selectedFields: CommonSelectedFields;
    flatObjectMetadata: FlatObjectMetadata;
    isFromOneToManyRelation?: boolean;
  }): CommonSelectedFieldsResult {
    const accumulator: CommonSelectedFieldsResult = {
      columns: {},
      aggregates: {},
      relations: {},
      relationFieldsCount: 0,
      hasAtLeastTwoNestedOneToManyRelations: false,
    };

    const selectedRelationEntries = Object.entries(selectedFields.relations);

    this.aggregateParser.parse({
      selectedAggregates: selectedFields.aggregates,
      flatObjectMetadata,
      flatFieldMetadataMaps: this.flatFieldMetadataMaps,
      accumulator,
    });

    for (const fieldMetadataId of flatObjectMetadata.fieldIds) {
      const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: this.flatFieldMetadataMaps,
      });

      if (
        isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION)
      ) {
        this.parseRelationSelections({
          fieldMetadata,
          selectedFields,
          selectedRelationEntries,
          accumulator,
          isFromOneToManyRelation,
        });

        continue;
      }

      if (
        isFlatFieldMetadataOfType(
          fieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        ) &&
        !isMorphRelationHead(fieldMetadata)
      ) {
        const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
          flatEntityMaps: this.flatObjectMetadataMaps,
        });

        if (
          !fieldMetadata.settings?.relationType ||
          !isDefined(targetObjectMetadata)
        ) {
          continue;
        }

        this.parseRelationSelections({
          fieldMetadata,
          selectedFields,
          selectedRelationEntries,
          accumulator,
          isFromOneToManyRelation,
        });

        continue;
      }

      if (!isFieldSelected({ selectedFields, fieldName: fieldMetadata.name })) {
        continue;
      }

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        Object.assign(
          accumulator.columns,
          this.parseCompositeField(
            fieldMetadata,
            selectedFields.fields[fieldMetadata.name],
          ),
        );

        continue;
      }

      accumulator.columns[fieldMetadata.name] = true;
    }

    return accumulator;
  }

  // A relation appears once per distinct set of arguments, each under its own key
  private parseRelationSelections({
    fieldMetadata,
    selectedFields,
    selectedRelationEntries,
    accumulator,
    isFromOneToManyRelation,
  }: {
    fieldMetadata:
      | FlatFieldMetadata<FieldMetadataType.RELATION>
      | FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
    selectedFields: Pick<CommonSelectedFields, 'fields'>;
    selectedRelationEntries: [string, CommonSelectedRelation][];
    accumulator: CommonSelectedFieldsResult;
    isFromOneToManyRelation?: boolean;
  }): void {
    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: fieldMetadata.name,
    });

    if (isFieldSelected({ selectedFields, fieldName: joinColumnName })) {
      accumulator.columns[joinColumnName] = true;
    }

    for (const [relationKey, selectedRelation] of selectedRelationEntries) {
      if (selectedRelation.fieldName !== fieldMetadata.name) {
        continue;
      }

      this.commonQuerySelectedFieldsRelationParser.parseRelationField({
        fieldMetadata,
        relationKey,
        selectedRelation,
        accumulator,
        isFromOneToManyRelation,
      });
    }
  }

  private parseCompositeField(
    fieldMetadata: OrmFlatFieldMetadata,
    subFields: boolean | Record<string, boolean>,
  ): Record<string, true> {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    return Object.fromEntries(
      Object.keys(subFields)
        .filter((subFieldKey) => subFieldKey !== '__typename')
        .map((subFieldKey): [string, true] => {
          const subFieldMetadata = compositeType.properties.find(
            (property) => property.name === subFieldKey,
          );

          if (!subFieldMetadata) {
            throw new Error(
              `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
            );
          }

          return [`${fieldMetadata.name}${capitalize(subFieldKey)}`, true];
        }),
    );
  }
}
