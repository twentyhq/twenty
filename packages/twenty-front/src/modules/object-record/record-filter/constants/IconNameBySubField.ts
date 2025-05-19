import { CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';

export const ICON_NAME_BY_SUB_FIELD: Partial<
  Record<CompositeFieldSubFieldName, string>
> = {
  currencyCode: 'IconCurrencyDollar',
  amountMicros: 'IconNumber95Small',
  name: 'IconAlignJustified',
  source: 'IconFileArrowLeft',
  primaryEmail: 'IconMail',
  additionalEmails: 'IconList',
  primaryLinkLabel: 'IconLabel',
  primaryLinkUrl: 'IconLink',
  secondaryLinks: 'IconList',
  primaryPhoneCallingCode: 'IconPlus',
  additionalPhones: 'IconList',
};
