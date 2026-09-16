import { isDefined } from 'twenty-sdk/utils';

import { type ContactToCreate } from 'src/logic-functions/types/contact-write.type';
import {
  type EmailAddress,
  type Name,
  type PersonResponse,
} from 'src/logic-functions/types/google-response.type';

const buildFingerprint = (
  names: Name[] | undefined,
  emailAddresses: EmailAddress[] | undefined,
): string =>
  JSON.stringify([
    names?.[0]?.givenName ?? '',
    names?.[0]?.familyName ?? '',
    (emailAddresses ?? [])
      .map((emailAddress) => emailAddress.value ?? '')
      .sort(),
  ]);

const isSameContact = (
  { contact }: ContactToCreate,
  personResponse: PersonResponse | undefined,
): boolean => {
  const person = personResponse?.person;

  return (
    isDefined(person) &&
    buildFingerprint(person.names, person.emailAddresses) ===
      buildFingerprint(contact.names, contact.emailAddresses)
  );
};

export const matchCreatedPeople = ({
  contactsToCreate,
  createdPeople,
}: {
  contactsToCreate: ContactToCreate[];
  createdPeople: PersonResponse[];
}): (PersonResponse | undefined)[] => {
  const isRequestOrder = contactsToCreate.every(
    (contactToCreate, index) =>
      !isDefined(createdPeople[index]?.person) ||
      isSameContact(contactToCreate, createdPeople[index]),
  );

  if (isRequestOrder) {
    return contactsToCreate.map((_, index) => createdPeople[index]);
  }

  const peopleByFingerprint = new Map<string, PersonResponse[]>();

  for (const personResponse of createdPeople) {
    const person = personResponse.person;

    if (!isDefined(person)) {
      continue;
    }

    const fingerprint = buildFingerprint(person.names, person.emailAddresses);

    peopleByFingerprint.set(fingerprint, [
      ...(peopleByFingerprint.get(fingerprint) ?? []),
      personResponse,
    ]);
  }

  return contactsToCreate.map(({ contact }) =>
    peopleByFingerprint
      .get(buildFingerprint(contact.names, contact.emailAddresses))
      ?.shift(),
  );
};
