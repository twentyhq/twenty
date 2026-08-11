import { FieldMetadataType } from "src/logic-functions/types/field-metadata-type.enum";
import { FieldsListType, RelationType } from "src/logic-functions/types/find-objects-fields.type";

// Ground truth: packages/twenty-shared/src/constants/CompositeFieldTypeSubFieldsNames.ts
// Read and write shapes for composite fields are identical, so this same subfield list
// is used both to build the read selection set and to know which keys to copy verbatim.
const COMPOSITE_FIELD_TYPE_SUB_FIELDS: Partial<Record<FieldMetadataType, string[]>> = {
  [FieldMetadataType.CURRENCY]: ['amountMicros', 'currencyCode'],
  [FieldMetadataType.EMAILS]: ['primaryEmail', 'additionalEmails'],
  [FieldMetadataType.LINKS]: ['primaryLinkUrl', 'primaryLinkLabel', 'secondaryLinks'],
  [FieldMetadataType.PHONES]: ['primaryPhoneCallingCode', 'primaryPhoneCountryCode', 'primaryPhoneNumber', 'additionalPhones'],
  [FieldMetadataType.FULL_NAME]: ['firstName', 'lastName'],
  [FieldMetadataType.ADDRESS]: ['addressStreet1', 'addressStreet2', 'addressCity', 'addressState', 'addressCountry', 'addressPostcode', 'addressLat', 'addressLng'],
  [FieldMetadataType.ACTOR]: ['source', 'name', 'workspaceMemberId', 'context'],
  [FieldMetadataType.RICH_TEXT]: ['blocknote', 'markdown'],
};

export type RecordFieldPlan = {
  // GraphQL selection body to read a record's non-system, non-omitted fields
  selectionSet: string;
  // top-level keys on a fetched record that should be copied into a create/update payload
  dataKeys: string[];
  // subset of dataKeys that hold a MANY_TO_ONE relation's target record id and need remapping
  // from the source workspace's record ids to the target workspace's record ids
  relationForeignKeyNames: string[];
  // subset of dataKeys (SELECT/RATING: single value, MULTI_SELECT: array of values) whose values
  // are GraphQL enum literals and must be emitted unquoted rather than as quoted strings
  enumDataKeys: string[];
};

// MORPH_RELATION fields (polymorphic targets, e.g. note/task targets) are skipped: out of scope.
// ONE_TO_MANY relation fields are skipped: they have no scalar column on this side of the relation.
export const buildRecordFieldPlan = (
  fieldsList: FieldsListType[],
  fieldsToOmit: string[],
): RecordFieldPlan => {
  const selectionParts: string[] = [];
  const dataKeys: string[] = [];
  const relationForeignKeyNames: string[] = [];
  const enumDataKeys: string[] = [];

  for (const field of fieldsList) {
    if (fieldsToOmit.includes(field.name)) {
      continue;
    }

    if (field.type === FieldMetadataType.MORPH_RELATION) {
      continue;
    }

    if (field.type === FieldMetadataType.RELATION) {
      if (field.relation?.type !== RelationType.MANY_TO_ONE) {
        continue;
      }
      const foreignKeyName = `${field.name}Id`;
      selectionParts.push(foreignKeyName);
      dataKeys.push(foreignKeyName);
      relationForeignKeyNames.push(foreignKeyName);
      continue;
    }

    if (
      field.type === FieldMetadataType.SELECT ||
      field.type === FieldMetadataType.MULTI_SELECT ||
      field.type === FieldMetadataType.RATING
    ) {
      enumDataKeys.push(field.name);
    }

    const subFields = COMPOSITE_FIELD_TYPE_SUB_FIELDS[field.type];
    if (subFields !== undefined) {
      selectionParts.push(`${field.name} { ${subFields.join(' ')} }`);
    } else {
      selectionParts.push(field.name);
    }
    dataKeys.push(field.name);
  }

  return {
    selectionSet: selectionParts.join('\n'),
    dataKeys,
    relationForeignKeyNames,
    enumDataKeys,
  };
};
