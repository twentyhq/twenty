import { isNonEmptyString } from '@sniptt/guards';

import { type UserInfoFragmentFragment } from '~/generated-admin/graphql';

export const formatAdminBillingArrangementOperator = ({
  firstName,
  lastName,
  email,
}: Pick<
  UserInfoFragmentFragment,
  'firstName' | 'lastName' | 'email'
>): string => {
  const fullName = [firstName, lastName].filter(isNonEmptyString).join(' ');

  return isNonEmptyString(fullName) ? `${fullName} (${email})` : email;
};
