import { isNonEmptyString } from '@sniptt/guards';

import {
  isUrlOnOneOfDomains,
  LINKEDIN_DOMAINS,
  X_DOMAINS,
} from 'src/logic-functions/data/link-domain.util';
import { type GoogleContactWriteInput } from 'src/logic-functions/types/google-request.type';
import { type Person } from 'src/logic-functions/types/google-response.type';
import { type TwentyPersonRecord } from 'src/logic-functions/types/twenty-person.type';

const mapNames = (
  person: TwentyPersonRecord,
): GoogleContactWriteInput['names'] => {
  const givenName = person.name?.firstName?.trim() ?? '';
  const familyName = person.name?.lastName?.trim() ?? '';

  if (givenName === '' && familyName === '') {
    return undefined;
  }

  return [{ givenName, familyName }];
};

const mapEmailAddresses = (
  person: TwentyPersonRecord,
): GoogleContactWriteInput['emailAddresses'] => {
  const emails = [
    person.emails?.primaryEmail,
    ...(person.emails?.additionalEmails ?? []),
  ]
    .filter(isNonEmptyString)
    .map((email) => email.trim());

  return emails.length === 0
    ? undefined
    : emails.map((email) => ({ value: email }));
};

const formatPhoneNumber = (
  number: string | null | undefined,
  callingCode: string | null | undefined,
): string | undefined => {
  if (!isNonEmptyString(number)) {
    return undefined;
  }

  return isNonEmptyString(callingCode)
    ? `${callingCode}${number.trim()}`
    : number.trim();
};

const mapPhoneNumbers = (
  person: TwentyPersonRecord,
): GoogleContactWriteInput['phoneNumbers'] => {
  const phoneNumbers = [
    formatPhoneNumber(
      person.phones?.primaryPhoneNumber,
      person.phones?.primaryPhoneCallingCode,
    ),
    ...(person.phones?.additionalPhones ?? []).map((additionalPhone) =>
      formatPhoneNumber(additionalPhone.number, additionalPhone.callingCode),
    ),
  ].filter(isNonEmptyString);

  return phoneNumbers.length === 0
    ? undefined
    : phoneNumbers.map((phoneNumber) => ({ value: phoneNumber }));
};

const mapOrganizations = (
  person: TwentyPersonRecord,
  existingContact: Person | undefined,
): GoogleContactWriteInput['organizations'] => {
  const companyName = person.company?.name?.trim();
  const jobTitle = person.jobTitle?.trim();

  if (!isNonEmptyString(companyName) && !isNonEmptyString(jobTitle)) {
    return undefined;
  }

  const [existingOrganization, ...otherOrganizations] =
    existingContact?.organizations ?? [];

  return [
    {
      ...existingOrganization,
      ...(isNonEmptyString(companyName) ? { name: companyName } : {}),
      ...(isNonEmptyString(jobTitle) ? { title: jobTitle } : {}),
    },
    ...otherOrganizations,
  ];
};

const mapUrls = (
  person: TwentyPersonRecord,
  existingContact: Person | undefined,
): GoogleContactWriteInput['urls'] => {
  const twentyUrls = [
    person.linkedinLink?.primaryLinkUrl,
    person.xLink?.primaryLinkUrl,
  ].filter(isNonEmptyString);

  if (twentyUrls.length === 0) {
    return undefined;
  }

  const preservedUrls = (existingContact?.urls ?? []).filter(
    (url) =>
      isNonEmptyString(url.value) &&
      !isUrlOnOneOfDomains(url.value, [...LINKEDIN_DOMAINS, ...X_DOMAINS]),
  );

  return [...preservedUrls, ...twentyUrls.map((url) => ({ value: url }))];
};

export const mapTwentyPerson = (
  person: TwentyPersonRecord,
  existingContact?: Person,
): GoogleContactWriteInput => {
  const names = mapNames(person);
  const emailAddresses = mapEmailAddresses(person);
  const phoneNumbers = mapPhoneNumbers(person);
  const organizations = mapOrganizations(person, existingContact);
  const urls = mapUrls(person, existingContact);

  return {
    ...(names ? { names } : {}),
    ...(emailAddresses ? { emailAddresses } : {}),
    ...(phoneNumbers ? { phoneNumbers } : {}),
    ...(organizations ? { organizations } : {}),
    ...(urls ? { urls } : {}),
  };
};
