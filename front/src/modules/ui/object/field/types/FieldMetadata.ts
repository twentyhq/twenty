import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { MainIdentifierMapper } from '@/ui/object/field/types/MainIdentifierMapper';

export type FieldUuidMetadata = {
  fieldName: string;
};

export type FieldBooleanMetadata = {
  fieldName: string;
};

export type FieldTextMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type FieldDateMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type FieldNumberMetadata = {
  fieldName: string;
  placeHolder: string;
  isPositive?: boolean;
};

export type FieldLinkMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type FieldCurrencyMetadata = {
  fieldName: string;
  placeHolder: string;
  isPositive?: boolean;
};

export type FieldFullNameMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type FieldEmailMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type FieldPhoneMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type FieldProbabilityMetadata = {
  fieldName: string;
};

export type FieldDefinitionRelationType =
  | 'FROM_MANY_OBJECTS'
  | 'FROM_ONE_OBJECT'
  | 'TO_MANY_OBJECTS'
  | 'TO_ONE_OBJECT';

export type FieldRelationMetadata = {
  fieldName: string;
  useEditButton?: boolean;
  relationType?: FieldDefinitionRelationType;
  mainIdentifierMapper: MainIdentifierMapper;
  searchFields: string[];
  objectMetadataNameSingular: string;
  objectMetadataNamePlural: string;
};

export type FieldMetadata =
  | FieldBooleanMetadata
  | FieldNumberMetadata
  | FieldDateMetadata
  | FieldTextMetadata
  | FieldUuidMetadata
  | FieldCurrencyMetadata
  | FieldLinkMetadata
  | FieldPhoneMetadata
  | FieldEmailMetadata
  | FieldProbabilityMetadata
  | FieldRelationMetadata
  | FieldFullNameMetadata;

export type FieldTextValue = string;
export type FieldUUidValue = string;
export type FieldDateValue = string | null;
export type FieldNumberValue = number | null;
export type FieldBooleanValue = boolean;

export type FieldPhoneValue = string;
export type FieldEmailValue = string;
export type FieldLinkValue = { url: string; label: string };
export type FieldCurrencyValue = { currencyCode: string; amountMicros: number };
export type FieldFullNameValue = { firstName: string; lastName: string };
export type FieldProbabilityValue = number;

export type FieldRelationValue = EntityForSelect | null;
