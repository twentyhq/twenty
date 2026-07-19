import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'class-validator';

// Only transform subfields that are present on the input. Omitted keys stay
// undefined so partial updates (e.g. additionalEmails only) do not null out
// stored primaryEmail — same contract as ADDRESS / FULL_NAME transformers.
export const transformEmailsValue = (
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any,
  // oxlint-disable-next-line typescript/no-explicit-any
): any => {
  if (!isDefined(value)) {
    return value;
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  const result: Record<string, any> = {};

  if ('primaryEmail' in value) {
    result.primaryEmail = isNonEmptyString(value.primaryEmail)
      ? value.primaryEmail.toLowerCase()
      : null;
  }

  if ('additionalEmails' in value) {
    let additionalEmails = value.additionalEmails;

    if (additionalEmails) {
      try {
        const emailArray = (
          isNonEmptyString(additionalEmails)
            ? JSON.parse(additionalEmails)
            : additionalEmails
        ) as string[];

        additionalEmails = isNonEmptyArray(emailArray)
          ? JSON.stringify(emailArray.map((email) => email.toLowerCase()))
          : null;
      } catch {
        /* empty */
      }
    }

    result.additionalEmails = additionalEmails;
  }

  return result;
};
