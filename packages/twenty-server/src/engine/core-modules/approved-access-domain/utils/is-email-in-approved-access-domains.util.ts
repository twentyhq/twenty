import { getDomainFromEmail } from 'twenty-shared/utils';

import { type ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';

export const isEmailInApprovedAccessDomains = ({
  email,
  approvedAccessDomains,
  isEmailVerificationRequired,
}: {
  email: string;
  approvedAccessDomains: Pick<
    ApprovedAccessDomainEntity,
    'domain' | 'isValidated'
  >[];
  isEmailVerificationRequired: boolean;
}): boolean => {
  if (!isEmailVerificationRequired) {
    return false;
  }

  const emailDomain = getDomainFromEmail(email);

  return approvedAccessDomains.some(
    (approvedAccessDomain) =>
      approvedAccessDomain.isValidated &&
      approvedAccessDomain.domain === emailDomain,
  );
};
