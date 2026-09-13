import { type CountryCode, parsePhoneNumberWithError } from 'libphonenumber-js';

import {
  isUrlOnOneOfDomains,
  LINKEDIN_DOMAINS,
  X_DOMAINS,
} from 'src/logic-functions/data/link-domain.util';
import {
  type Person,
  type PersonUrl,
} from 'src/logic-functions/types/google-response.type';
import {
  type TwentyLinkInput,
  type TwentyPersonInput,
  type TwentyPhonesInput,
} from 'src/logic-functions/types/twenty-person.type';
import { isDefined } from 'twenty-sdk/utils';
import { isNonEmptyString } from '@sniptt/guards';

const findLink = (
  urls: PersonUrl[] | undefined,
  domains: string[],
): TwentyLinkInput | undefined => {
  const matchingUrl = urls?.find(
    (url) =>
      isNonEmptyString(url.value) && isUrlOnOneOfDomains(url.value, domains),
  )?.value;

  if (!isNonEmptyString(matchingUrl)) {
    return undefined;
  }

  return {
    primaryLinkUrl: matchingUrl,
    primaryLinkLabel: '',
    secondaryLinks: null,
  };
};

const parsePhone = (
  rawPhoneNumber: string,
):
  | { number: string; countryCode: CountryCode | ''; callingCode: string }
  | undefined => {
  try {
    const parsedPhone = parsePhoneNumberWithError(rawPhoneNumber);

    return {
      number: parsedPhone.nationalNumber,
      countryCode: parsedPhone.getPossibleCountries()[0] ?? '',
      callingCode: `+${parsedPhone.countryCallingCode}`,
    };
  } catch {
    return undefined;
  }
};

const mapPhones = (person: Person): TwentyPhonesInput | undefined => {
  const parsedPhones = (person.phoneNumbers ?? [])
    .map((phoneNumber) => phoneNumber.canonicalForm ?? phoneNumber.value)
    .filter(isNonEmptyString)
    .map(parsePhone)
    .filter(isDefined);

  const [primaryPhone, ...additionalPhones] = parsedPhones;

  if (!isDefined(primaryPhone)) {
    return undefined;
  }

  return {
    primaryPhoneNumber: primaryPhone.number,
    primaryPhoneCountryCode: primaryPhone.countryCode,
    primaryPhoneCallingCode: primaryPhone.callingCode,
    additionalPhones,
  };
};

const mapName = (person: Person): TwentyPersonInput['name'] => {
  const name = person.names?.[0];

  if (!isDefined(name)) {
    return undefined;
  }

  if (isNonEmptyString(name.givenName) || isNonEmptyString(name.familyName)) {
    return {
      firstName: name.givenName?.trim() ?? '',
      lastName: name.familyName?.trim() ?? '',
    };
  }

  if (isNonEmptyString(name.displayName)) {
    return { firstName: name.displayName.trim(), lastName: '' };
  }

  return undefined;
};

const mapEmails = (person: Person): TwentyPersonInput['emails'] => {
  const emails = (person.emailAddresses ?? [])
    .map((emailAddress) => emailAddress.value)
    .filter(isNonEmptyString)
    .map((email) => email.trim());

  const [primaryEmail, ...additionalEmails] = emails;

  if (!isDefined(primaryEmail)) {
    return undefined;
  }

  return { primaryEmail, additionalEmails };
};

const mapAvatarUrl = (person: Person): string | undefined => {
  const avatarUrl = person.photos?.find(
    (photo) => !photo.default && isNonEmptyString(photo.url),
  )?.url;

  return isNonEmptyString(avatarUrl) ? avatarUrl : undefined;
};

export const mapGooglePerson = (
  person: Person,
): TwentyPersonInput | undefined => {
  const name = mapName(person);
  const emails = mapEmails(person);

  if (!isDefined(name) && !isDefined(emails)) {
    return undefined;
  }

  const phones = mapPhones(person);
  const jobTitle = person.organizations?.[0]?.title;
  const linkedinLink = findLink(person.urls, LINKEDIN_DOMAINS);
  const xLink = findLink(person.urls, X_DOMAINS);
  const avatarUrl = mapAvatarUrl(person);

  return {
    googleContactsId: person.resourceName.replace('people/', ''),
    ...(isDefined(name) ? { name } : {}),
    ...(isDefined(emails) ? { emails } : {}),
    ...(isDefined(phones) ? { phones } : {}),
    ...(isNonEmptyString(jobTitle) ? { jobTitle: jobTitle.trim() } : {}),
    ...(isDefined(linkedinLink) ? { linkedinLink } : {}),
    ...(isDefined(xLink) ? { xLink } : {}),
    ...(isDefined(avatarUrl) ? { avatarUrl } : {}),
  };
};
