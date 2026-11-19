import { type ConditionalAvailabilityRecordFieldKind } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldKind';
import { type ConditionalAvailabilityRecordFieldSubject } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldSubject';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import {
  type CompositeFieldSubFieldName,
  StandardObjectNameSingular,
} from 'twenty-shared/types';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const ADDRESS_SUB_FIELD_NAMES = [
  'addressCity',
  'addressStreet1',
  'addressStreet2',
  'addressState',
  'addressPostcode',
] as const satisfies CompositeFieldSubFieldName[];

const buildSubject = ({
  field,
  fieldKind,
  subFieldName,
}: {
  field: Pick<FieldMetadataItem, 'universalIdentifier' | 'name'>;
  fieldKind: ConditionalAvailabilityRecordFieldKind;
  subFieldName: CompositeFieldSubFieldName | null;
}): ConditionalAvailabilityRecordFieldSubject => ({
  fieldMetadataUniversalIdentifier: field.universalIdentifier,
  fieldName: field.name,
  subFieldName,
  fieldKind,
  propertyPath: isDefined(subFieldName)
    ? `${field.name}.${subFieldName}`
    : field.name,
});

export const getConditionalAvailabilityRecordFieldSubjects = ({
  field,
}: {
  field: FieldMetadataItem;
}): ConditionalAvailabilityRecordFieldSubject[] => {
  switch (field.type) {
    case FieldMetadataType.TEXT:
      return [buildSubject({ field, fieldKind: 'text', subFieldName: null })];
    case FieldMetadataType.UUID:
      return [
        buildSubject({ field, fieldKind: 'identifier', subFieldName: null }),
      ];
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.RATING:
      return [buildSubject({ field, fieldKind: 'number', subFieldName: null })];
    case FieldMetadataType.BOOLEAN:
      return [
        buildSubject({ field, fieldKind: 'boolean', subFieldName: null }),
      ];
    case FieldMetadataType.SELECT:
      return [buildSubject({ field, fieldKind: 'select', subFieldName: null })];
    case FieldMetadataType.MULTI_SELECT:
      return [
        buildSubject({ field, fieldKind: 'multiSelect', subFieldName: null }),
      ];
    case FieldMetadataType.DATE:
      return [buildSubject({ field, fieldKind: 'date', subFieldName: null })];
    case FieldMetadataType.DATE_TIME:
      return [
        buildSubject({ field, fieldKind: 'dateTime', subFieldName: null }),
      ];
    case FieldMetadataType.ARRAY:
      return [buildSubject({ field, fieldKind: 'list', subFieldName: null })];
    case FieldMetadataType.RAW_JSON:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.FILES:
      return [
        buildSubject({ field, fieldKind: 'emptinessOnly', subFieldName: null }),
      ];
    case FieldMetadataType.EMAILS:
      return [
        buildSubject({
          field,
          fieldKind: 'text',
          subFieldName: 'primaryEmail',
        }),
      ];
    case FieldMetadataType.LINKS:
      return [
        buildSubject({
          field,
          fieldKind: 'text',
          subFieldName: 'primaryLinkUrl',
        }),
      ];
    case FieldMetadataType.PHONES:
      return [
        buildSubject({
          field,
          fieldKind: 'text',
          subFieldName: 'primaryPhoneNumber',
        }),
      ];
    case FieldMetadataType.CURRENCY:
      return [
        buildSubject({
          field,
          fieldKind: 'currencyAmount',
          subFieldName: 'amountMicros',
        }),
        buildSubject({
          field,
          fieldKind: 'select',
          subFieldName: 'currencyCode',
        }),
      ];
    case FieldMetadataType.FULL_NAME:
      return [
        buildSubject({ field, fieldKind: 'text', subFieldName: 'firstName' }),
        buildSubject({ field, fieldKind: 'text', subFieldName: 'lastName' }),
      ];
    case FieldMetadataType.ADDRESS:
      return ADDRESS_SUB_FIELD_NAMES.map((subFieldName) =>
        buildSubject({ field, fieldKind: 'text', subFieldName }),
      );
    case FieldMetadataType.ACTOR:
      return [
        buildSubject({
          field,
          fieldKind: 'workspaceMemberRelation',
          subFieldName: 'workspaceMemberId',
        }),
        buildSubject({ field, fieldKind: 'select', subFieldName: 'source' }),
        buildSubject({ field, fieldKind: 'text', subFieldName: 'name' }),
      ];
    case FieldMetadataType.RELATION: {
      if (
        hasJunctionConfig(field.settings) ||
        field.relation?.type !== RelationType.MANY_TO_ONE
      ) {
        return [];
      }

      return [
        {
          fieldMetadataUniversalIdentifier: field.universalIdentifier,
          fieldName: field.name,
          subFieldName: null,
          fieldKind:
            field.relation.targetObjectMetadata.nameSingular ===
            StandardObjectNameSingular.WorkspaceMember
              ? 'workspaceMemberRelation'
              : 'recordRelation',
          propertyPath: computeRelationGqlFieldJoinColumnName({
            name: field.name,
          }),
        },
      ];
    }
    case FieldMetadataType.MORPH_RELATION:
    case FieldMetadataType.RICH_TEXT:
    case FieldMetadataType.POSITION:
    case FieldMetadataType.TS_VECTOR:
      return [];
  }
};
