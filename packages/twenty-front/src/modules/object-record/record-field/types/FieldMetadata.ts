import { RATING_VALUES } from '@/object-record/record-field/meta-types/constants/RatingValues';
import { ZodHelperLiteral } from '@/object-record/record-field/types/ZodHelperLiteral';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { ThemeColor } from 'twenty-ui/theme';
import { z } from 'zod';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { CurrencyCode } from './CurrencyCode';

type BaseFieldMetadata = {
  fieldName: string;
  objectMetadataNameSingular?: string;
  isCustom?: boolean;
};

export type FieldUuidMetadata = BaseFieldMetadata & {
  settings?: null;
};

export type FieldBooleanMetadata = BaseFieldMetadata & {
  settings?: null;
};

export type FieldTextMetadata = BaseFieldMetadata & {
  placeHolder: string;
  settings?: {
    displayedMaxRows?: number;
  };
};

export enum FieldDateDisplayFormat {
  RELATIVE = 'RELATIVE',
  USER_SETTINGS = 'USER_SETTINGS',
  CUSTOM = 'CUSTOM',
}

export type FieldDateMetadataSettings =
  | {
      displayFormat?: FieldDateDisplayFormat.CUSTOM;
      customUnicodeDateFormat: string;
    }
  | {
      displayFormat?: Exclude<
        FieldDateDisplayFormat,
        FieldDateDisplayFormat.CUSTOM
      >;
    };

export type FieldDateTimeMetadata = BaseFieldMetadata & {
  placeHolder: string;
  settings?: FieldDateMetadataSettings;
};

export type FieldDateMetadata = BaseFieldMetadata & {
  placeHolder: string;
  settings?: FieldDateMetadataSettings;
};

export type FieldNumberVariant = 'number' | 'percentage';

export type FieldNumberMetadata = BaseFieldMetadata & {
  placeHolder: string;
  isPositive?: boolean;
  settings?: {
    decimals?: number;
    type?: FieldNumberVariant;
  };
};

export type FieldLinkMetadata = BaseFieldMetadata & {
  placeHolder: string;
  settings?: null;
};

export type FieldLinksMetadata = BaseFieldMetadata & {
  settings?: null;
};

export type FieldCurrencyMetadata = BaseFieldMetadata & {
  placeHolder: string;
  isPositive?: boolean;
  settings?: null;
};

export type FieldFullNameMetadata = BaseFieldMetadata & {
  placeHolder: string;
  settings?: null;
};

export type FieldEmailMetadata = BaseFieldMetadata & {
  placeHolder: string;
  settings?: null;
};

export type FieldEmailsMetadata = BaseFieldMetadata & {
  settings?: null;
};

export type FieldPhoneMetadata = BaseFieldMetadata & {
  placeHolder: string;
  settings?: null;
};

export type FieldRatingMetadata = BaseFieldMetadata & {
  settings?: null;
};

export type FieldAddressMetadata = BaseFieldMetadata & {
  placeHolder: string;
  settings?: null;
};

export type FieldRawJsonMetadata = BaseFieldMetadata & {
  placeHolder: string;
  settings?: null;
};

export type FieldRichTextV2Metadata = BaseFieldMetadata & {
  settings?: null;
};

export type FieldRichTextMetadata = BaseFieldMetadata & {
  settings?: null;
};

export type FieldPositionMetadata = BaseFieldMetadata & {
  settings?: null;
};

export type FieldRelationMetadata = BaseFieldMetadata & {
  relationFieldMetadataId: string;
  relationObjectMetadataNamePlural: string;
  relationObjectMetadataNameSingular: string;
  relationType?: RelationDefinitionType;
  targetFieldMetadataName?: string;
  useEditButton?: boolean;
  settings?: null;
};

export type FieldSelectMetadata = BaseFieldMetadata & {
  options: { label: string; color: ThemeColor; value: string }[];
  isNullable: boolean;
  settings?: null;
};

export type FieldMultiSelectMetadata = BaseFieldMetadata & {
  options: { label: string; color: ThemeColor; value: string }[];
  settings?: null;
};

export type FieldActorMetadata = BaseFieldMetadata & {
  settings?: null;
};

export type FieldArrayMetadata = BaseFieldMetadata & {
  values: { label: string; value: string }[];
  settings?: null;
};

export type FieldPhonesMetadata = BaseFieldMetadata & {
  settings?: null;
};

export type FieldTsVectorMetadata = BaseFieldMetadata & {
  settings?: null;
};

export type FieldMetadata =
  | FieldBooleanMetadata
  | FieldCurrencyMetadata
  | FieldDateTimeMetadata
  | FieldDateMetadata
  | FieldEmailMetadata
  | FieldFullNameMetadata
  | FieldLinkMetadata
  | FieldNumberMetadata
  | FieldPhoneMetadata
  | FieldRatingMetadata
  | FieldRelationMetadata
  | FieldRichTextMetadata
  | FieldSelectMetadata
  | FieldMultiSelectMetadata
  | FieldTextMetadata
  | FieldUuidMetadata
  | FieldAddressMetadata
  | FieldActorMetadata
  | FieldArrayMetadata
  | FieldTsVectorMetadata
  | FieldRichTextV2Metadata
  | FieldRichTextMetadata;

export type FieldTextValue = string;
export type FieldUUidValue = string; // TODO: can we replace with a template literal type, or maybe overkill ?
export type FieldDateTimeValue = string | null;
export type FieldDateValue = string | null;
export type FieldNumberValue = number | null;
export type FieldBooleanValue = boolean;

export type FieldEmailsValue = {
  primaryEmail: string;
  additionalEmails: string[] | null;
};
export type FieldLinksValue = {
  primaryLinkLabel: string | null;
  primaryLinkUrl: string | null;
  secondaryLinks?: { label: string | null; url: string | null }[] | null;
};
export type FieldCurrencyValue = {
  currencyCode: CurrencyCode;
  amountMicros: number | null;
};
export type FormFieldCurrencyValue = {
  currencyCode: CurrencyCode | null;
  amountMicros: number | string | null;
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
export type FieldRatingValue = (typeof RATING_VALUES)[number] | null;
export type FieldSelectValue = string | null;
export type FieldMultiSelectValue = string[] | null;

export type FieldRelationToOneValue = ObjectRecord | null;

export type FieldRelationFromManyValue = ObjectRecord[];

export type FieldRelationValue<
  T extends FieldRelationToOneValue | FieldRelationFromManyValue,
> = T;

export type Json = ZodHelperLiteral | { [key: string]: Json } | Json[];
export type FieldJsonValue = Record<string, Json> | Json[] | null;

export type FieldRichTextV2Value = {
  blocknote: string | null;
  markdown: string | null;
};

export type FieldRichTextValue = null | string;

const FieldActorSourceSchema = z.union([
  z.literal('API'),
  z.literal('IMPORT'),
  z.literal('EMAIL'),
  z.literal('CALENDAR'),
  z.literal('MANUAL'),
  z.literal('SYSTEM'),
  z.literal('WORKFLOW'),
  z.literal('WEBHOOK'),
]);

export const FieldActorValueSchema = z.object({
  source: FieldActorSourceSchema,
  workspaceMemberId: z.string().nullable(),
  name: z.string(),
  context: z
    .object({
      provider: z.nativeEnum(ConnectedAccountProvider).optional(),
    })
    .nullable(),
});
export type FieldActorValue = z.infer<typeof FieldActorValueSchema>;

export type FieldActorForInputValue = Pick<
  FieldActorValue,
  'context' | 'source'
>;

export type FieldArrayValue = string[];

export type PhoneRecord = {
  number: string;
  callingCode: string;
  countryCode: string;
};

export type FieldPhonesValue = {
  primaryPhoneNumber: string;
  primaryPhoneCountryCode: string;
  primaryPhoneCallingCode?: string;
  additionalPhones?: PhoneRecord[] | null;
};
