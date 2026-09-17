import { isNonEmptyString } from '@sniptt/guards';

import {
  isUrlOnOneOfDomains,
  LINKEDIN_DOMAINS,
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
    return [];
  }

  return [{ givenName, familyName }];
};

const mapEmailAddresses = (
  person: TwentyPersonRecord,
): GoogleContactWriteInput['emailAddresses'] =>
  [person.emails?.primaryEmail, ...(person.emails?.additionalEmails ?? [])]
    .filter(isNonEmptyString)
    .map((email) => ({ value: email.trim() }));

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
): GoogleContactWriteInput['phoneNumbers'] =>
  [
    formatPhoneNumber(
      person.phones?.primaryPhoneNumber,
      person.phones?.primaryPhoneCallingCode,
    ),
    ...(person.phones?.additionalPhones ?? []).map((additionalPhone) =>
      formatPhoneNumber(additionalPhone.number, additionalPhone.callingCode),
    ),
  ]
    .filter(isNonEmptyString)
    .map((phoneNumber) => ({ value: phoneNumber }));

const mapOrganizations = (
  person: TwentyPersonRecord,
  existingContact: Person | undefined,
): GoogleContactWriteInput['organizations'] => {
  const companyName = person.company?.name?.trim();
  const jobTitle = person.jobTitle?.trim();

  const [existingOrganization, ...otherOrganizations] =
    existingContact?.organizations ?? [];

  const {
    name: _name,
    title: _title,
    ...preservedFields
  } = existingOrganization ?? {};

  const organization = {
    ...preservedFields,
    ...(isNonEmptyString(companyName) ? { name: companyName } : {}),
    ...(isNonEmptyString(jobTitle) ? { title: jobTitle } : {}),
  };

  return Object.keys(organization).length === 0
    ? otherOrganizations
    : [organization, ...otherOrganizations];
};

const mapUrls = (
  person: TwentyPersonRecord,
  existingContact: Person | undefined,
): GoogleContactWriteInput['urls'] => {
  const twentyUrls = [person.linkedinLink?.primaryLinkUrl].filter(
    isNonEmptyString,
  );

  const preservedUrls = (existingContact?.urls ?? []).filter(
    (url) =>
      isNonEmptyString(url.value) &&
      !isUrlOnOneOfDomains(url.value, LINKEDIN_DOMAINS),
  );

  return [...preservedUrls, ...twentyUrls.map((url) => ({ value: url }))];
};

export const mapTwentyPerson = (
  person: TwentyPersonRecord,
  existingContact?: Person,
): GoogleContactWriteInput => ({
  names: mapNames(person),
  emailAddresses: mapEmailAddresses(person),
  phoneNumbers: mapPhoneNumbers(person),
  organizations: mapOrganizations(person, existingContact),
  urls: mapUrls(person, existingContact),
});

export const hasContactContent = (contact: GoogleContactWriteInput): boolean =>
  Object.values(contact).some((fieldValues) => fieldValues.length > 0);
