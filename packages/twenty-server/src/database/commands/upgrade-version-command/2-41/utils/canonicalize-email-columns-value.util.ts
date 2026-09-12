import { canonicalizeEmail } from 'twenty-shared/utils';

export type EmailColumnsValue = {
  primaryEmail: unknown;
  additionalEmails: unknown;
};

export type CanonicalEmailColumnsValue = EmailColumnsValue & {
  hasChanges: boolean;
};

const areJsonValuesEqual = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

export const canonicalizeEmailColumnsValue = ({
  primaryEmail,
  additionalEmails,
}: EmailColumnsValue): CanonicalEmailColumnsValue => {
  const canonicalPrimaryEmail =
    typeof primaryEmail === 'string'
      ? canonicalizeEmail(primaryEmail)
      : primaryEmail;

  const canonicalAdditionalEmails = Array.isArray(additionalEmails)
    ? additionalEmails.map((email) =>
        typeof email === 'string' ? canonicalizeEmail(email) : email,
      )
    : additionalEmails;

  return {
    primaryEmail: canonicalPrimaryEmail,
    additionalEmails: canonicalAdditionalEmails,
    hasChanges:
      canonicalPrimaryEmail !== primaryEmail ||
      !areJsonValuesEqual(canonicalAdditionalEmails, additionalEmails),
  };
};
