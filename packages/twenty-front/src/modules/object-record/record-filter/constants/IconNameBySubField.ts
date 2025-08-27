import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';

export const ICON_NAME_BY_SUB_FIELD: Partial<
  Record<CompositeFieldSubFieldName, string>
> = {
  currencyCode: 'IconCurrencyDollar',
  amountMicros: 'IconNumber95Small',
  name: 'IconTextSize',
  source: 'IconTransferIn',
  primaryEmail: 'IconMail',
  additionalEmails: 'IconMailPlus',
  primaryLinkLabel: 'IconTextSize',
  primaryLinkUrl: 'IconLink',
  secondaryLinks: 'IconLinkPlus',
  primaryPhoneNumber: 'IconPhoneCall',
  primaryPhoneCallingCode: 'IconFlag',
  additionalPhones: 'IconPhonePlus',
  addressCity: 'IconMapPin',
  addressCountry: 'IconMapPin',
  addressPostcode: 'IconMapPin',
  addressStreet1: 'IconMapPin',
  addressStreet2: 'IconMapPin',
  addressState: 'IconMapPin',
  firstName: 'IconTextSize',
  lastName: 'IconTextSize',
};
