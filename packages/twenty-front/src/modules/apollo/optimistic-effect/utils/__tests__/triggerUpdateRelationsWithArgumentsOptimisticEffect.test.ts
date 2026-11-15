import { gql } from '@apollo/client';

import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { triggerUpdateRelationsWithArgumentsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsWithArgumentsOptimisticEffect';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeRelationWithArgumentsResponseKey } from 'twenty-shared/utils';
import { InMemoryTestingCacheInstance } from '~/testing/cache/inMemoryTestingCacheInstance';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const companyObjectMetadataItem = objectMetadataItems.find(
  ({ nameSingular }) => nameSingular === 'company',
)!;

const personObjectMetadataItem = objectMetadataItems.find(
  ({ nameSingular }) => nameSingular === 'person',
)!;

const COMPANY_ID = '20202020-1111-4000-8000-000000000001';
const PARIS_PERSON_ID = '20202020-2222-4000-8000-000000000001';
const SECOND_PARIS_PERSON_ID = '20202020-2222-4000-8000-000000000002';
const NEW_PERSON_ID = '20202020-2222-4000-8000-000000000003';

const buildPerson = (
  id: string,
  city: string,
  jobTitle: string,
): ObjectRecord => ({
  __typename: 'Person',
  id,
  city,
  jobTitle,
  companyId: COMPANY_ID,
});

const RELATION_ARGUMENTS = {
  filter: { city: { eq: 'Paris' } },
  orderBy: [{ jobTitle: 'AscNullsLast' as const }],
  first: 2,
};

const RESPONSE_KEY = computeRelationWithArgumentsResponseKey({
  relationFieldName: 'people',
  ...RELATION_ARGUMENTS,
});

const COMPANY_PEOPLE_QUERY = gql`
  query Company(
    $filter: PersonFilterInput
    $orderBy: [PersonOrderByInput]
    $first: Int
  ) {
    company {
      __typename
      id
      people {
        __typename
        edges {
          __typename
          node {
            __typename
            id
          }
          cursor
        }
      }
      scopedPeople: people(filter: $filter, orderBy: $orderBy, first: $first) {
        __typename
        edges {
          __typename
          node {
            __typename
            id
          }
          cursor
        }
      }
    }
  }
`;

const buildPeopleConnection = (peopleIds: string[]) => ({
  __typename: 'PersonConnection',
  edges: peopleIds.map((personId) => ({
    __typename: 'PersonEdge',
    node: { __typename: 'Person', id: personId },
    cursor: '',
  })),
});

const upsertRecordsInStore = jest.fn();

const buildCache = (scopedPeopleIds: string[]) => {
  const { cache } = new InMemoryTestingCacheInstance({
    objectMetadataItems,
    initialRecordsInCache: [
      {
        objectMetadataItem: personObjectMetadataItem,
        records: [
          buildPerson(PARIS_PERSON_ID, 'Paris', 'Designer'),
          buildPerson(SECOND_PARIS_PERSON_ID, 'Paris', 'Engineer'),
          buildPerson(NEW_PERSON_ID, 'Paris', 'Accountant'),
        ],
      },
    ],
  });

  cache.writeQuery({
    query: COMPANY_PEOPLE_QUERY,
    variables: RELATION_ARGUMENTS,
    data: {
      company: {
        __typename: 'Company',
        id: COMPANY_ID,
        people: buildPeopleConnection(scopedPeopleIds),
        scopedPeople: buildPeopleConnection(scopedPeopleIds),
      },
    },
  });

  return cache;
};

const readCachedPeopleIds = (cache: ReturnType<typeof buildCache>) => {
  const result = cache.readQuery<
    Record<
      'company',
      Record<'people' | 'scopedPeople', { edges: { node: { id: string } }[] }>
    >
  >({ query: COMPANY_PEOPLE_QUERY, variables: RELATION_ARGUMENTS });

  return {
    people: result?.company.people.edges.map(({ node }) => node.id),
    scopedPeople: result?.company.scopedPeople.edges.map(({ node }) => node.id),
  };
};

const getLastUpsertedScopedPeopleIds = () =>
  upsertRecordsInStore.mock.calls
    .flatMap(([{ partialRecords }]) => partialRecords)
    .filter((partialRecord) => RESPONSE_KEY in partialRecord)
    .at(-1)
    ?.[RESPONSE_KEY].map(({ id }: ObjectRecord) => id);

const commonEffectArguments = {
  targetObjectMetadataItem: companyObjectMetadataItem,
  fieldNameOnTargetRecord: 'people',
  targetRecordId: COMPANY_ID,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId: {},
  upsertRecordsInStore,
};

describe('triggerUpdateRelationsWithArgumentsOptimisticEffect', () => {
  beforeEach(() => {
    upsertRecordsInStore.mockClear();
  });

  it('adds an attached record that matches the filter, in order, within the limit', () => {
    const cache = buildCache([PARIS_PERSON_ID, SECOND_PARIS_PERSON_ID]);

    triggerAttachRelationOptimisticEffect({
      ...commonEffectArguments,
      cache,
      sourceObjectNameSingular: 'person',
      sourceRecord: buildPerson(NEW_PERSON_ID, 'Paris', 'Accountant'),
    });

    expect(readCachedPeopleIds(cache)).toEqual({
      people: [PARIS_PERSON_ID, SECOND_PARIS_PERSON_ID, NEW_PERSON_ID],
      scopedPeople: [NEW_PERSON_ID, PARIS_PERSON_ID],
    });
    expect(getLastUpsertedScopedPeopleIds()).toEqual([
      NEW_PERSON_ID,
      PARIS_PERSON_ID,
    ]);
  });

  it('leaves the copy alone when the attached record does not match the filter', () => {
    const cache = buildCache([PARIS_PERSON_ID]);

    triggerAttachRelationOptimisticEffect({
      ...commonEffectArguments,
      cache,
      sourceObjectNameSingular: 'person',
      sourceRecord: buildPerson(NEW_PERSON_ID, 'London', 'Accountant'),
    });

    expect(readCachedPeopleIds(cache)).toEqual({
      people: [PARIS_PERSON_ID, NEW_PERSON_ID],
      scopedPeople: [PARIS_PERSON_ID],
    });
    expect(getLastUpsertedScopedPeopleIds()).toBeUndefined();
  });

  it('removes a detached record', () => {
    const cache = buildCache([PARIS_PERSON_ID, SECOND_PARIS_PERSON_ID]);

    triggerDetachRelationOptimisticEffect({
      ...commonEffectArguments,
      cache,
      sourceObjectNameSingular: 'person',
      sourceRecordId: PARIS_PERSON_ID,
    });

    expect(readCachedPeopleIds(cache)).toEqual({
      people: [SECOND_PARIS_PERSON_ID],
      scopedPeople: [SECOND_PARIS_PERSON_ID],
    });
    expect(getLastUpsertedScopedPeopleIds()).toEqual([SECOND_PARIS_PERSON_ID]);
  });

  it('removes a record that stays attached but stops matching the filter', () => {
    const cache = buildCache([PARIS_PERSON_ID, SECOND_PARIS_PERSON_ID]);

    triggerUpdateRelationsWithArgumentsOptimisticEffect({
      ...commonEffectArguments,
      cache,
      sourceObjectMetadataItem: personObjectMetadataItem,
      sourceRecordId: PARIS_PERSON_ID,
      attachedSourceRecord: buildPerson(PARIS_PERSON_ID, 'London', 'Designer'),
    });

    expect(readCachedPeopleIds(cache)).toEqual({
      people: [PARIS_PERSON_ID, SECOND_PARIS_PERSON_ID],
      scopedPeople: [SECOND_PARIS_PERSON_ID],
    });
    expect(getLastUpsertedScopedPeopleIds()).toEqual([SECOND_PARIS_PERSON_ID]);
  });
});
