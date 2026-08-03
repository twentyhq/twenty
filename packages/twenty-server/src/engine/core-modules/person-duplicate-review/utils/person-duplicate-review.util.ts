import { createHash } from 'node:crypto';

import {
  type EmailsMetadata,
  type LinksMetadata,
  type PhonesMetadata,
} from 'twenty-shared/types';

import { type PersonDuplicatePairDecisionEntity } from 'src/engine/core-modules/person-duplicate-review/entities/person-duplicate-pair-decision.entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const PERSON_DUPLICATE_REASONS = {
  EMAIL: 'EMAIL',
  LINKEDIN: 'LINKEDIN',
  PHONE: 'PHONE',
  NAME: 'NAME',
} as const;

export type PersonDuplicateReason =
  (typeof PERSON_DUPLICATE_REASONS)[keyof typeof PERSON_DUPLICATE_REASONS];

export type PersonDuplicateIdentity = {
  fingerprint: string;
  name: string | null;
  emails: string[];
  phones: string[];
  linkedinUrls: string[];
};

export type PersonDuplicatePair = {
  leftPersonId: string;
  rightPersonId: string;
  reasons: PersonDuplicateReason[];
};

export type PersonDuplicateComputedGroup = {
  id: string;
  people: PersonWorkspaceEntity[];
  reasons: PersonDuplicateReason[];
  detectedAt: Date;
  score: number;
};

const normalizeText = (value: string): string =>
  value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();

const normalizeEmail = (value: string): string => normalizeText(value);

const normalizePhone = ({
  number,
  callingCode,
}: {
  number: string;
  callingCode: string;
}): string | null => {
  const normalizedCallingCode = callingCode.replace(/\D/g, '');
  const normalizedNumber = number.replace(/\D/g, '');
  const normalizedPhone = `${normalizedCallingCode}${normalizedNumber}`;

  return normalizedPhone.length >= 7 ? normalizedPhone : null;
};

const normalizeUrl = (value: string): string | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const url = new URL(
      /^[a-z][a-z\d+.-]*:\/\//i.test(trimmedValue)
        ? trimmedValue
        : `https://${trimmedValue}`,
    );
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = url.pathname
      .normalize('NFKC')
      .replace(/\/+$/, '')
      .toLowerCase();

    return `${hostname}${pathname}`;
  } catch {
    return normalizeText(trimmedValue);
  }
};

const uniqueSorted = (values: Array<string | null | undefined>): string[] =>
  [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ].sort();

const getEmails = (emails: EmailsMetadata | null | undefined): string[] =>
  uniqueSorted([
    emails?.primaryEmail ? normalizeEmail(emails.primaryEmail) : null,
    ...(emails?.additionalEmails ?? []).map(normalizeEmail),
  ]);

const getPhones = (phones: PhonesMetadata | null | undefined): string[] =>
  uniqueSorted([
    phones?.primaryPhoneNumber
      ? normalizePhone({
          number: phones.primaryPhoneNumber,
          callingCode: phones.primaryPhoneCallingCode ?? '',
        })
      : null,
    ...(phones?.additionalPhones ?? []).map((phone) =>
      normalizePhone({
        number: phone.number,
        callingCode: phone.callingCode,
      }),
    ),
  ]);

const getLinks = (links: LinksMetadata | null | undefined): string[] =>
  uniqueSorted([
    links?.primaryLinkUrl ? normalizeUrl(links.primaryLinkUrl) : null,
    ...(links?.secondaryLinks ?? []).map(({ url }) => normalizeUrl(url)),
  ]);

export const getPersonDuplicateIdentity = (
  person: PersonWorkspaceEntity,
): PersonDuplicateIdentity => {
  const firstName = normalizeText(person.name?.firstName ?? '');
  const lastName = normalizeText(person.name?.lastName ?? '');
  const name = firstName && lastName ? `${firstName}\u0000${lastName}` : null;
  const emails = getEmails(person.emails);
  const phones = getPhones(person.phones);
  const linkedinUrls = getLinks(person.linkedinLink);
  const fingerprint = createHash('sha256')
    .update(
      JSON.stringify({
        name,
        emails,
        phones,
        linkedinUrls,
      }),
    )
    .digest('hex');

  return {
    fingerprint,
    name,
    emails,
    phones,
    linkedinUrls,
  };
};

export const getSortedPersonPair = (
  firstPersonId: string,
  secondPersonId: string,
): [string, string] =>
  firstPersonId.localeCompare(secondPersonId) <= 0
    ? [firstPersonId, secondPersonId]
    : [secondPersonId, firstPersonId];

const getPairKey = (firstPersonId: string, secondPersonId: string): string =>
  getSortedPersonPair(firstPersonId, secondPersonId).join(':');

const addPairReason = (
  pairsByKey: Map<string, Set<PersonDuplicateReason>>,
  firstPersonId: string,
  secondPersonId: string,
  reason: PersonDuplicateReason,
): void => {
  if (firstPersonId === secondPersonId) {
    return;
  }

  const pairKey = getPairKey(firstPersonId, secondPersonId);
  const reasons = pairsByKey.get(pairKey) ?? new Set<PersonDuplicateReason>();

  reasons.add(reason);
  pairsByKey.set(pairKey, reasons);
};

const addIdentifierPairs = (
  pairsByKey: Map<string, Set<PersonDuplicateReason>>,
  identifiersByPersonId: Map<string, string[]>,
  reason: PersonDuplicateReason,
): void => {
  const personIdsByIdentifier = new Map<string, string[]>();

  for (const [personId, identifiers] of identifiersByPersonId) {
    for (const identifier of identifiers) {
      const personIds = personIdsByIdentifier.get(identifier) ?? [];

      personIds.push(personId);
      personIdsByIdentifier.set(identifier, personIds);
    }
  }

  for (const personIds of personIdsByIdentifier.values()) {
    for (let firstIndex = 0; firstIndex < personIds.length; firstIndex++) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < personIds.length;
        secondIndex++
      ) {
        addPairReason(
          pairsByKey,
          personIds[firstIndex],
          personIds[secondIndex],
          reason,
        );
      }
    }
  }
};

export const buildPersonDuplicatePairs = (
  people: PersonWorkspaceEntity[],
): {
  identitiesByPersonId: Map<string, PersonDuplicateIdentity>;
  pairs: PersonDuplicatePair[];
} => {
  const identitiesByPersonId = new Map(
    people.map((person) => [person.id, getPersonDuplicateIdentity(person)]),
  );
  const pairsByKey = new Map<string, Set<PersonDuplicateReason>>();

  addIdentifierPairs(
    pairsByKey,
    new Map(
      people.map(({ id }) => {
        const name = identitiesByPersonId.get(id)?.name;

        return [id, name ? [name] : []];
      }),
    ),
    PERSON_DUPLICATE_REASONS.NAME,
  );
  addIdentifierPairs(
    pairsByKey,
    new Map(
      people.map(({ id }) => [id, identitiesByPersonId.get(id)?.emails ?? []]),
    ),
    PERSON_DUPLICATE_REASONS.EMAIL,
  );
  addIdentifierPairs(
    pairsByKey,
    new Map(
      people.map(({ id }) => [id, identitiesByPersonId.get(id)?.phones ?? []]),
    ),
    PERSON_DUPLICATE_REASONS.PHONE,
  );
  addIdentifierPairs(
    pairsByKey,
    new Map(
      people.map(({ id }) => [
        id,
        identitiesByPersonId.get(id)?.linkedinUrls ?? [],
      ]),
    ),
    PERSON_DUPLICATE_REASONS.LINKEDIN,
  );

  return {
    identitiesByPersonId,
    pairs: [...pairsByKey.entries()].map(([pairKey, reasons]) => {
      const [leftPersonId, rightPersonId] = pairKey.split(':');

      return {
        leftPersonId,
        rightPersonId,
        reasons: [...reasons],
      };
    }),
  };
};

const isPairStillDismissed = ({
  pair,
  decision,
  identitiesByPersonId,
}: {
  pair: PersonDuplicatePair;
  decision: PersonDuplicatePairDecisionEntity | undefined;
  identitiesByPersonId: Map<string, PersonDuplicateIdentity>;
}): boolean => {
  if (!decision) {
    return false;
  }

  return (
    decision.leftFingerprint ===
      identitiesByPersonId.get(pair.leftPersonId)?.fingerprint &&
    decision.rightFingerprint ===
      identitiesByPersonId.get(pair.rightPersonId)?.fingerprint
  );
};

const getGroupScore = (reasons: PersonDuplicateReason[]): number => {
  const weights: Record<PersonDuplicateReason, number> = {
    EMAIL: 400,
    LINKEDIN: 350,
    PHONE: 300,
    NAME: 100,
  };
  const evidenceScore = reasons.reduce(
    (total, reason) => total + weights[reason],
    0,
  );

  return evidenceScore + (reasons.length > 1 ? 1000 : 0);
};

export const buildPersonDuplicateGroups = ({
  people,
  decisions,
}: {
  people: PersonWorkspaceEntity[];
  decisions: PersonDuplicatePairDecisionEntity[];
}): PersonDuplicateComputedGroup[] => {
  const { pairs, identitiesByPersonId } = buildPersonDuplicatePairs(people);
  const decisionsByPairKey = new Map(
    decisions.map((decision) => [
      getPairKey(decision.leftPersonId, decision.rightPersonId),
      decision,
    ]),
  );
  const activePairs = pairs.filter(
    (pair) =>
      !isPairStillDismissed({
        pair,
        decision: decisionsByPairKey.get(
          getPairKey(pair.leftPersonId, pair.rightPersonId),
        ),
        identitiesByPersonId,
      }),
  );
  const parentByPersonId = new Map<string, string>();

  const find = (personId: string): string => {
    const parentId = parentByPersonId.get(personId) ?? personId;

    if (parentId === personId) {
      parentByPersonId.set(personId, personId);

      return personId;
    }

    const rootId = find(parentId);

    parentByPersonId.set(personId, rootId);

    return rootId;
  };

  const union = (firstPersonId: string, secondPersonId: string): void => {
    const firstRootId = find(firstPersonId);
    const secondRootId = find(secondPersonId);

    if (firstRootId !== secondRootId) {
      parentByPersonId.set(secondRootId, firstRootId);
    }
  };

  for (const pair of activePairs) {
    union(pair.leftPersonId, pair.rightPersonId);
  }

  const peopleById = new Map(people.map((person) => [person.id, person]));
  const personIdsByRootId = new Map<string, string[]>();

  for (const personId of parentByPersonId.keys()) {
    const rootId = find(personId);
    const personIds = personIdsByRootId.get(rootId) ?? [];

    personIds.push(personId);
    personIdsByRootId.set(rootId, personIds);
  }

  return [...personIdsByRootId.values()]
    .map((personIds) => {
      const personIdSet = new Set(personIds);
      const groupPeople = personIds
        .map((personId) => peopleById.get(personId))
        .filter((person): person is PersonWorkspaceEntity => Boolean(person))
        .sort(
          (firstPerson, secondPerson) =>
            new Date(firstPerson.createdAt).getTime() -
            new Date(secondPerson.createdAt).getTime(),
        );
      const reasons = uniqueSorted(
        activePairs
          .filter(
            ({ leftPersonId, rightPersonId }) =>
              personIdSet.has(leftPersonId) && personIdSet.has(rightPersonId),
          )
          .flatMap(({ reasons: pairReasons }) => pairReasons),
      ) as PersonDuplicateReason[];
      const detectedAt = new Date(
        Math.max(
          ...groupPeople.map(({ createdAt }) => new Date(createdAt).getTime()),
        ),
      );
      const id = createHash('sha256')
        .update([...personIds].sort().join(':'))
        .digest('hex');

      return {
        id,
        people: groupPeople,
        reasons,
        detectedAt,
        score: getGroupScore(reasons),
      };
    })
    .sort(
      (firstGroup, secondGroup) =>
        secondGroup.score - firstGroup.score ||
        firstGroup.detectedAt.getTime() - secondGroup.detectedAt.getTime(),
    );
};
