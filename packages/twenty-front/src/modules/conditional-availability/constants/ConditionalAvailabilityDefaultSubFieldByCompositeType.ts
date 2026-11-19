import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';

export const CONDITIONAL_AVAILABILITY_DEFAULT_SUB_FIELD_BY_COMPOSITE_TYPE: Partial<
  Record<CompositeFieldType, CompositeFieldSubFieldName>
> = {
  CURRENCY: 'amountMicros',
  FULL_NAME: 'firstName',
  ADDRESS: 'addressCity',
  ACTOR: 'workspaceMemberId',
  EMAILS: 'primaryEmail',
  LINKS: 'primaryLinkUrl',
  PHONES: 'primaryPhoneNumber',
};
