import { FieldDefinition } from '../FieldDefinition';
import {
  FieldBooleanMetadata,
  FieldChipMetadata,
  FieldDateMetadata,
  FieldDoubleTextChipMetadata,
  FieldDoubleTextMetadata,
  FieldEmailMetadata,
  FieldMetadata,
  FieldMoneyAmountV2Metadata,
  FieldMoneyMetadata,
  FieldNumberMetadata,
  FieldPhoneMetadata,
  FieldProbabilityMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
  FieldURLV2Metadata,
} from '../FieldMetadata';
import { FieldType } from '../FieldType';

type AssertFieldMetadataFunction = <
  E extends FieldType,
  T extends E extends 'TEXT'
    ? FieldTextMetadata
    : E extends 'RELATION'
    ? FieldRelationMetadata
    : E extends 'CHIP'
    ? FieldChipMetadata
    : E extends 'DOUBLE_TEXT_CHIP'
    ? FieldDoubleTextChipMetadata
    : E extends 'DOUBLE_TEXT'
    ? FieldDoubleTextMetadata
    : E extends 'NUMBER'
    ? FieldNumberMetadata
    : E extends 'EMAIL'
    ? FieldEmailMetadata
    : E extends 'BOOLEAN'
    ? FieldBooleanMetadata
    : E extends 'DATE'
    ? FieldDateMetadata
    : E extends 'PHONE'
    ? FieldPhoneMetadata
    : E extends 'URL'
    ? FieldURLMetadata
    : E extends 'URL_V2'
    ? FieldURLV2Metadata
    : E extends 'PROBABILITY'
    ? FieldProbabilityMetadata
    : E extends 'MONEY_AMOUNT'
    ? FieldMoneyMetadata
    : E extends 'MONEY_AMOUNT_V2'
    ? FieldMoneyAmountV2Metadata
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
