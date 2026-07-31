import {
  type PersonDuplicateLink,
  type PersonDuplicatePairInput,
  type PersonDuplicatePerson,
  type PersonDuplicatePhone,
} from '@/person-duplicate-review/types/PersonDuplicateReview';

export const getPersonDuplicateDisplayName = (
  person: PersonDuplicatePerson,
): string =>
  `${person.firstName} ${person.lastName}`.trim() || 'Unnamed person';

export const getPersonDuplicatePhoneKey = (
  phone: PersonDuplicatePhone,
): string =>
  `${phone.callingCode.replace(/\D/g, '')}:${phone.number.replace(/\D/g, '')}`;

export const getPersonDuplicateLinkKey = (link: PersonDuplicateLink): string =>
  link.url.trim().toLowerCase();

export const getUniquePersonDuplicateEmails = (
  people: PersonDuplicatePerson[],
): string[] => [
  ...new Map(
    people
      .flatMap(({ emails }) => emails)
      .filter(Boolean)
      .map((email) => [email.trim().toLowerCase(), email.trim()]),
  ).values(),
];

export const getUniquePersonDuplicatePhones = (
  people: PersonDuplicatePerson[],
): PersonDuplicatePhone[] => [
  ...new Map(
    people
      .flatMap(({ phones }) => phones)
      .filter(({ number }) => Boolean(number))
      .map((phone) => [getPersonDuplicatePhoneKey(phone), phone]),
  ).values(),
];

export const getUniquePersonDuplicateLinks = (
  people: PersonDuplicatePerson[],
): PersonDuplicateLink[] => [
  ...new Map(
    people
      .flatMap(({ linkedinLinks }) => linkedinLinks)
      .filter(({ url }) => Boolean(url))
      .map((link) => [getPersonDuplicateLinkKey(link), link]),
  ).values(),
];

export const getAllPersonDuplicatePairs = (
  people: PersonDuplicatePerson[],
): PersonDuplicatePairInput[] => {
  const pairs: PersonDuplicatePairInput[] = [];

  for (let leftIndex = 0; leftIndex < people.length; leftIndex++) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < people.length;
      rightIndex++
    ) {
      pairs.push({
        leftPersonId: people[leftIndex].id,
        rightPersonId: people[rightIndex].id,
      });
    }
  }

  return pairs;
};
