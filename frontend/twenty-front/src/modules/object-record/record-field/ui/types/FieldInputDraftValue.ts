import {
  type FieldActorValue,
  type FieldAddressValue,
  type FieldBooleanValue,
  type FieldCurrencyValue,
  type FieldDateTimeValue,
  type FieldEmailsValue,
  type FieldFullNameValue,
  type FieldJsonValue,
  type FieldLinksValue,
  type FieldMultiSelectValue,
  type FieldNumberValue,
  type FieldPhonesValue,
  type FieldRelationFromManyValue,
  type FieldRelationToOneValue,
  type FieldSelectValue,
  type FieldTextValue,
  type FieldUUidValue,
  type PhoneRecord,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { type CurrencyCode } from 'twenty-shared/constants';
import { type FieldRatingValue } from 'twenty-shared/types';

export type FieldTextDraftValue = string;
export type FieldNumberDraftValue = number;
export type FieldDateTimeDraftValue = string;
export type FieldPhonesDraftValue = {
  primaryPhoneNumber: string;
  primaryPhoneCountryCode: string;
  primaryPhoneCallingCode: string;
  additionalPhones?: PhoneRecord[] | null;
};
export type FieldEmailsDraftValue = {
  primaryEmail: string;
  additionalEmails: string[] | null;
};
export type FieldSelectDraftValue = string;
export type FieldMultiSelectDraftValue = string[];
export type FieldRelationDraftValue = string;
export type FieldRelationManyDraftValue = string[];
export type FieldLinksDraftValue = {
  primaryLinkLabel: string;
  primaryLinkUrl: string;
  secondaryLinks?: { label: string; url: string }[] | null;
};
export type FieldCurrencyDraftValue = {
  currencyCode: CurrencyCode;
  amount: string;
};
export type FieldFullNameDraftValue = { firstName: string; lastName: string };
export type FieldAddressDraftValue = {
  addressStreet1: string;
  addressStreet2: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressPostcode: string | null;
  addressCountry: string | null;
  addressLat: number | null;
  addressLng: number | null;
};
export type FieldJsonDraftValue = string;
export type FieldActorDraftValue = {
  source: string;
  workspaceMemberId?: string;
  name: string;
};

export type FieldInputDraftValue<FieldValue> = FieldValue extends FieldTextValue
  ? FieldTextDraftValue
  : FieldValue extends FieldUUidValue
    ? FieldUUidValue
    : FieldValue extends FieldDateTimeValue
      ? FieldDateTimeDraftValue
      : FieldValue extends FieldNumberValue
        ? FieldNumberDraftValue
        : FieldValue extends FieldBooleanValue
          ? FieldBooleanValue
          : FieldValue extends FieldPhonesValue
            ? FieldPhonesDraftValue
            : FieldValue extends FieldEmailsValue
              ? FieldEmailsDraftValue
              : FieldValue extends FieldLinksValue
                ? FieldLinksDraftValue
                : FieldValue extends FieldCurrencyValue
                  ? FieldCurrencyDraftValue
                  : FieldValue extends FieldFullNameValue
                    ? FieldFullNameDraftValue
                    : FieldValue extends FieldRatingValue
                      ? FieldRatingValue
                      : FieldValue extends FieldSelectValue
                        ? FieldSelectDraftValue
                        : FieldValue extends FieldMultiSelectValue
                          ? FieldMultiSelectDraftValue
                          : FieldValue extends FieldRelationToOneValue
                            ? FieldRelationDraftValue
                            : FieldValue extends FieldRelationFromManyValue
                              ? FieldRelationManyDraftValue
                              : FieldValue extends FieldAddressValue
                                ? FieldAddressDraftValue
                                : FieldValue extends FieldJsonValue
                                  ? FieldJsonDraftValue
                                  : FieldValue extends FieldActorValue
                                    ? FieldActorDraftValue
                                    : never;
