import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export type FieldUuidMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type FieldTextMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type FieldPhoneMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type FieldURLMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type FieldLinkMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type FieldDateMetadata = {
  fieldName: string;
};

export type FieldNumberMetadata = {
  fieldName: string;
  placeHolder: string;
  isPositive?: boolean;
};

export type FieldMoneyMetadata = {
  fieldName: string;
  placeHolder: string;
  isPositive?: boolean;
};

export type FieldCurrencyMetadata = {
  fieldName: string;
  placeHolder: string;
  isPositive?: boolean;
};

export type FieldEmailMetadata = {
  fieldName: string;
  placeHolder: string;
};

export type FieldRelationMetadata = {
  relationType: Entity;
  fieldName: string;
  useEditButton?: boolean;
};

export type FieldChipMetadata = {
  relationType: Entity;
  contentFieldName: string;
  urlFieldName: string;
  placeHolder: string;
};

export type FieldDoubleTextMetadata = {
  firstValueFieldName: string;
  firstValuePlaceholder: string;
  secondValueFieldName: string;
  secondValuePlaceholder: string;
};

export type FieldDoubleTextChipMetadata = {
  firstValueFieldName: string;
  firstValuePlaceholder: string;
  secondValueFieldName: string;
  secondValuePlaceholder: string;
  avatarUrlFieldName: string;
  entityType: Entity;
};

export type FieldProbabilityMetadata = {
  fieldName: string;
};

export type FieldBooleanMetadata = {
  fieldName: string;
};

export type FieldMetadata =
  | FieldBooleanMetadata
  | FieldChipMetadata
  | FieldCurrencyMetadata
  | FieldDateMetadata
  | FieldDoubleTextChipMetadata
  | FieldDoubleTextMetadata
  | FieldEmailMetadata
  | FieldLinkMetadata
  | FieldMoneyMetadata
  | FieldNumberMetadata
  | FieldPhoneMetadata
  | FieldProbabilityMetadata
  | FieldRelationMetadata
  | FieldTextMetadata
  | FieldURLMetadata
  | FieldUuidMetadata;

export type FieldTextValue = string;
export type FieldUUidValue = string;

export type FieldChipValue = string;
export type FieldDateValue = string | null;
export type FieldPhoneValue = string;
export type FieldURLValue = string;
export type FieldLinkValue = { url: string; label: string };
export type FieldNumberValue = number | null;
export type FieldMoneyValue = number | null;
export type FieldCurrencyValue = { currencyCode: string; amountMicros: number };

export type FieldEmailValue = string;
export type FieldProbabilityValue = number;
export type FieldBooleanValue = boolean;

export type FieldDoubleTextValue = {
  firstValue: string;
  secondValue: string;
};

export type FieldDoubleTextChipValue = {
  firstValue: string;
  secondValue: string;
};

export type FieldRelationValue = EntityForSelect | null;
