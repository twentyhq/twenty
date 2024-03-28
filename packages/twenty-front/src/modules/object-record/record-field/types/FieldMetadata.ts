import { RATING_VALUES } from '@/object-record/record-field/meta-types/constants/RatingValues';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { ThemeColor } from '@/ui/theme/constants/MainColorNames';

import { CurrencyCode } from './CurrencyCode';

export type FieldUuidMetadata = {
  objectMetadataNameSingular?: string;
  fieldName: string;
};

export type FieldBooleanMetadata = {
  objectMetadataNameSingular?: string;
  fieldName: string;
};

export type FieldTextMetadata = {
  objectMetadataNameSingular?: string;
  placeHolder: string;
  fieldName: string;
};

export type FieldDateTimeMetadata = {
  objectMetadataNameSingular?: string;
  placeHolder: string;
  fieldName: string;
};

export type FieldNumberMetadata = {
  objectMetadataNameSingular?: string;
  fieldName: string;
  placeHolder: string;
  isPositive?: boolean;
};

export type FieldLinkMetadata = {
  objectMetadataNameSingular?: string;
  placeHolder: string;
  fieldName: string;
};

export type FieldCurrencyMetadata = {
  objectMetadataNameSingular?: string;
  fieldName: string;
  placeHolder: string;
  isPositive?: boolean;
};

export type FieldFullNameMetadata = {
  objectMetadataNameSingular?: string;
  placeHolder: string;
  fieldName: string;
};

export type FieldEmailMetadata = {
  objectMetadataNameSingular?: string;
  placeHolder: string;
  fieldName: string;
};

export type FieldPhoneMetadata = {
  objectMetadataNameSingular?: string;
  placeHolder: string;
  fieldName: string;
};

export type FieldRatingMetadata = {
  objectMetadataNameSingular?: string;
  fieldName: string;
};

export type FieldAddressMetadata = {
  objectMetadataNameSingular?: string;
  placeHolder: string;
  fieldName: string;
};

export type FieldRawJsonMetadata = {
  objectMetadataNameSingular?: string;
  fieldName: string;
};

export type FieldDefinitionRelationType =
  | 'FROM_MANY_OBJECTS'
  | 'FROM_ONE_OBJECT'
  | 'TO_MANY_OBJECTS'
  | 'TO_ONE_OBJECT';

export type FieldRelationMetadata = {
  fieldName: string;
  objectMetadataNameSingular?: string;
  relationFieldMetadataId: string;
  relationObjectMetadataNamePlural: string;
  relationObjectMetadataNameSingular: string;
  relationType?: FieldDefinitionRelationType;
  useEditButton?: boolean;
};

export type FieldSelectMetadata = {
  objectMetadataNameSingular?: string;
  fieldName: string;
  options: { label: string; color: ThemeColor; value: string }[];
};

export type FieldMetadata =
  | FieldBooleanMetadata
  | FieldCurrencyMetadata
  | FieldDateTimeMetadata
  | FieldEmailMetadata
  | FieldFullNameMetadata
  | FieldLinkMetadata
  | FieldNumberMetadata
  | FieldPhoneMetadata
  | FieldRatingMetadata
  | FieldRelationMetadata
  | FieldSelectMetadata
  | FieldTextMetadata
  | FieldUuidMetadata
  | FieldAddressMetadata;

export type FieldTextValue = string;
export type FieldUUidValue = string;
export type FieldDateTimeValue = string | null;
export type FieldNumberValue = number | null;
export type FieldBooleanValue = boolean;

export type FieldPhoneValue = string;
export type FieldEmailValue = string;
export type FieldLinkValue = { url: string; label: string };
export type FieldCurrencyValue = {
  currencyCode: CurrencyCode;
  amountMicros: number | null;
};
export type FieldFullNameValue = { firstName: string; lastName: string };
export type FieldAddressValue = {
  addressStreet1: string;
  addressStreet2: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressPostcode: string | null;
  addressCountry: string | null;
  addressLat: number | null;
  addressLng: number | null;
};
export type FieldRatingValue = (typeof RATING_VALUES)[number];
export type FieldSelectValue = string | null;

export type FieldRelationValue = EntityForSelect | null;
