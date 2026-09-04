import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isNonEmptyString } from '@sniptt/guards';
import { parseJson } from 'twenty-shared/utils';

export type TimelinePhonesDiffValue = Omit<
  FieldPhonesValue,
  'additionalPhones'
> & {
  additionalPhones?: FieldPhonesValue['additionalPhones'] | string;
};

export const normalizeTimelinePhonesDiffValue = (
  diffValue: TimelinePhonesDiffValue,
): FieldPhonesValue => {
  const { additionalPhones, ...primaryPhoneFields } = diffValue;

  if (!isNonEmptyString(additionalPhones)) {
    return {
      ...primaryPhoneFields,
      additionalPhones: additionalPhones ?? null,
    };
  }

  const parsedAdditionalPhones =
    parseJson<FieldPhonesValue['additionalPhones']>(additionalPhones);

  return {
    ...primaryPhoneFields,
    additionalPhones: Array.isArray(parsedAdditionalPhones)
      ? parsedAdditionalPhones
      : null,
  };
};
