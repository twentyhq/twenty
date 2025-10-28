import { isNull, isUndefined } from '@sniptt/guards';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { computePossibleMorphGqlFieldForFieldName } from '@/object-record/cache/utils/computePossibleMorphGqlFieldForFieldName';
import { getFieldMetadataFromGqlField } from '@/object-record/cache/utils/getFieldMetadataFromGqlField';
import { getMorphRelationFromFieldMetadataAndGqlField } from '@/object-record/cache/utils/getMorphRelationFromFieldMetadataAndGqlField';
import { getNodeTypename } from '@/object-record/cache/utils/getNodeTypename';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { getRefName } from '@/object-record/cache/utils/getRefName';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import { pascalCase } from '~/utils/string/pascalCase';

export const getRecordNodeFromRecord = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  recordGqlFields,
  record,
  computeReferences = true,
  isRootLevel = true,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'namePlural' | 'nameSingular'
  >;
  recordGqlFields?: Record<string, any>;
  computeReferences?: boolean;
  isRootLevel?: boolean;
  record: T | null;
}) => {
  if (isNull(record)) {
    return null;
  }

  const nodeTypeName = getNodeTypename(objectMetadataItem.nameSingular);

  if (!isRootLevel && computeReferences) {
    return {
      __ref: getRefName(objectMetadataItem.nameSingular, record.id),
    } as unknown as RecordGqlNode; // Fix typing: we want a Reference in computeReferences mode
  }

  const nestedRecord = Object.fromEntries(
    Object.entries(record)
      .map(([gqlField, value]) => {
        if (isDefined(recordGqlFields) && !recordGqlFields[gqlField]) {
          return undefined;
        }

        const field = getFieldMetadataFromGqlField({
          objectMetadataItem,
          gqlField: gqlField,
        });

        if (isUndefined(field)) {
          return undefined;
        }

        if (
          field.type === FieldMetadataType.RELATION &&
          field.relation?.type === RelationType.ONE_TO_MANY
        ) {
          const oneToManyObjectMetadataItem = objectMetadataItems.find(
            (item) =>
              item.namePlural ===
              field.relation?.targetObjectMetadata.namePlural,
          );

          if (!oneToManyObjectMetadataItem) {
            return undefined;
          }

          return [
            gqlField,
            getRecordConnectionFromRecords({
              objectMetadataItems,
              objectMetadataItem: oneToManyObjectMetadataItem,
              records: value as ObjectRecord[],
              recordGqlFields:
                recordGqlFields?.[gqlField] === true ||
                isUndefined(recordGqlFields?.[gqlField])
                  ? undefined
                  : recordGqlFields?.[gqlField],
              withPageInfo: false,
              isRootLevel: false,
              computeReferences,
            }),
          ];
        }

        if (
          field.type === FieldMetadataType.MORPH_RELATION &&
          field.settings?.relationType === RelationType.ONE_TO_MANY
        ) {
          if (field.morphRelations?.length === 0) {
            return undefined;
          }

          const morphRelation = getMorphRelationFromFieldMetadataAndGqlField({
            objectMetadataItems,
            fieldMetadata: { morphRelations: field.morphRelations ?? [] },
            gqlField: gqlField,
          });

          if (isUndefined(morphRelation?.targetObjectMetadata?.nameSingular)) {
            return undefined;
          }

          if (!morphRelation?.targetObjectMetadata?.nameSingular) {
            return undefined;
          }

          return [
            gqlField,
            getRecordConnectionFromRecords({
              objectMetadataItems,
              objectMetadataItem: morphRelation?.targetObjectMetadata,
              records: value as ObjectRecord[],
              recordGqlFields:
                recordGqlFields?.[gqlField] === true ||
                isUndefined(recordGqlFields?.[gqlField])
                  ? undefined
                  : recordGqlFields?.[gqlField],
              withPageInfo: false,
              isRootLevel: false,
              computeReferences,
            }),
          ];
        }

        switch (field.type) {
          case FieldMetadataType.RELATION: {
            const isJoinColumn = field.settings?.joinColumnName === gqlField;
            if (isJoinColumn) {
              return [gqlField, value];
            }

            if (
              isUndefined(field.relation?.targetObjectMetadata.nameSingular)
            ) {
              return undefined;
            }

            if (isNull(value)) {
              return [gqlField, null];
            }

            if (isUndefined(value?.id)) {
              return undefined;
            }

            const typeName = getObjectTypename(
              field.relation?.targetObjectMetadata.nameSingular,
            );

            if (computeReferences) {
              return [
                gqlField,
                {
                  __ref: `${typeName}:${value.id}`,
                },
              ];
            }

            return [
              gqlField,
              {
                __typename: typeName,
                ...value,
              },
            ];
          }
          case FieldMetadataType.MORPH_RELATION: {
            const possibleMorphRelationsJoinColumnNames =
              computePossibleMorphGqlFieldForFieldName({
                fieldMetadata: {
                  morphRelations: field.morphRelations ?? [],
                  fieldName: field.name,
                },
              }).map(
                (possibleMorphRelationName) => `${possibleMorphRelationName}Id`,
              );

            const isJoinColumn =
              possibleMorphRelationsJoinColumnNames.includes(gqlField);
            if (isJoinColumn) {
              return [gqlField, value];
            }

            if (field.morphRelations?.length === 0) {
              return undefined;
            }

            const morphRelation = getMorphRelationFromFieldMetadataAndGqlField({
              objectMetadataItems,
              fieldMetadata: { morphRelations: field.morphRelations ?? [] },
              gqlField: gqlField,
            });

            if (
              isUndefined(morphRelation?.targetObjectMetadata?.nameSingular)
            ) {
              return undefined;
            }

            const typeName = getObjectTypename(
              morphRelation?.targetObjectMetadata?.nameSingular,
            );

            if (isNull(value)) {
              return [gqlField, null];
            }

            if (isUndefined(value?.id)) {
              return undefined;
            }

            if (computeReferences) {
              return [gqlField, { __ref: `${typeName}:${value.id}` }];
            }

            return [
              gqlField,
              {
                __typename: typeName,
                ...value,
              },
            ];
          }
          case FieldMetadataType.LINKS:
          case FieldMetadataType.ADDRESS:
          case FieldMetadataType.FULL_NAME:
          case FieldMetadataType.CURRENCY: {
            return [
              gqlField,
              {
                ...value,
                __typename: pascalCase(field.type),
              },
            ];
          }
          default: {
            return [gqlField, value];
          }
        }
      })
      .filter(isDefined),
  ) as T; // Todo fix typing once we have investigated apollo edges / nodes removal

  return { ...nestedRecord, __typename: nodeTypeName };
};
