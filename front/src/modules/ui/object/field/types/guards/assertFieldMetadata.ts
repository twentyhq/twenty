import { FieldDefinition } from '../FieldDefinition';
import {
  FieldBooleanMetadata,
  FieldChipMetadata,
  FieldCurrencyMetadata,
  FieldDateMetadata,
  FieldDoubleTextChipMetadata,
  FieldDoubleTextMetadata,
  FieldEmailMetadata,
  FieldEnumMetadata,
  FieldFullnameMetadata,
  FieldLinkMetadata,
  FieldMetadata,
  FieldMoneyMetadata,
  FieldNumberMetadata,
  FieldPhoneMetadata,
  FieldProbabilityMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
  FieldUuidMetadata,
} from '../FieldMetadata';
import { FieldType } from '../FieldType';

type AssertFieldMetadataFunction = <
  E extends FieldType,
  T extends E extends 'BOOLEAN'
    ? FieldBooleanMetadata
    : E extends 'CHIP'
    ? FieldChipMetadata
    : E extends 'CURRENCY'
    ? FieldCurrencyMetadata
    : E extends 'FULL_NAME'
    ? FieldFullnameMetadata
    : E extends 'DATE'
    ? FieldDateMetadata
    : E extends 'DOUBLE_TEXT'
    ? FieldDoubleTextMetadata
    : E extends 'DOUBLE_TEXT_CHIP'
    ? FieldDoubleTextChipMetadata
    : E extends 'EMAIL'
    ? FieldEmailMetadata
    : E extends 'LINK'
    ? FieldLinkMetadata
    : E extends 'MONEY_AMOUNT'
    ? FieldMoneyMetadata
    : E extends 'ENUM'
    ? FieldEnumMetadata
    : E extends 'NUMBER'
    ? FieldNumberMetadata
    : E extends 'PHONE'
    ? FieldPhoneMetadata
    : E extends 'PROBABILITY'
    ? FieldProbabilityMetadata
    : E extends 'RELATION'
    ? FieldRelationMetadata
    : E extends 'TEXT'
    ? FieldTextMetadata
    : E extends 'URL'
    ? FieldURLMetadata
    : E extends 'UUID'
    ? FieldUuidMetadata
    : never,
>(
  fieldType: E,
  fieldTypeGuard: (
    a: FieldDefinition<FieldMetadata>,
  ) => a is FieldDefinition<T>,
  fieldDefinition: FieldDefinition<FieldMetadata>,
) => asserts fieldDefinition is FieldDefinition<T>;

export const assertFieldMetadata: AssertFieldMetadataFunction = (
  fieldType,
  fieldTypeGuard,
  fieldDefinition,
) => {
  const fieldDefinitionType = fieldDefinition.type;

  if (!fieldTypeGuard(fieldDefinition) || fieldDefinitionType !== fieldType) {
    throw new Error(
      `Trying to use a "${fieldDefinitionType}" field as a "${fieldType}" field. Verify that the field is defined as a type "${fieldDefinitionType}" field in assertFieldMetadata.ts.`,
    );
  } else {
    return;
  }
};
