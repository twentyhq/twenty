import { gql } from '@apollo/client';

import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
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
const NEW_PERSON_ID = '20202020-2222-4000-8000-000000000002';

const buildPerson = ({
  id,
  city,
}: {
  id: string;
  city: string;
}): ObjectRecord => ({
  __typename: 'Person',
  id,
  city,
  companyId: COMPANY_ID,
  company: { __typename: 'Company', id: COMPANY_ID },
});

const RELATION_ARGUMENTS = {
  filter: { city: { eq: 'Paris' } },
  first: 1,
};

const PEOPLE_CONNECTION_SELECTION = `
  __typename
  edges {
    __typename
    node {
      __typename
      id
    }
    cursor
  }
`;

const COMPANY_PEOPLE_QUERY = gql`
  query CompanyPeople {
    company {
      __typename
      id
      people {
        ${PEOPLE_CONNECTION_SELECTION}
      }
    }
  }
`;

const COMPANY_SCOPED_PEOPLE_QUERY = gql`
  query CompanyScopedPeople($filter: PersonFilterInput, $first: Int) {
    company {
      __typename
      id
      scopedPeople: people(filter: $filter, first: $first) {
        ${PEOPLE_CONNECTION_SELECTION}
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

const buildCache = () => {
  const { cache } = new InMemoryTestingCacheInstance({
    objectMetadataItems,
    initialRecordsInCache: [
      {
        objectMetadataItem: personObjectMetadataItem,
        records: [
          buildPerson({ id: PARIS_PERSON_ID, city: 'Paris' }),
          buildPerson({ id: NEW_PERSON_ID, city: 'Paris' }),
        ],
      },
    ],
  });

  cache.writeQuery({
    query: COMPANY_PEOPLE_QUERY,
    data: {
      company: {
        __typename: 'Company',
        id: COMPANY_ID,
        people: buildPeopleConnection([PARIS_PERSON_ID]),
      },
    },
  });

  cache.writeQuery({
    query: COMPANY_SCOPED_PEOPLE_QUERY,
    variables: RELATION_ARGUMENTS,
    data: {
      company: {
        __typename: 'Company',
        id: COMPANY_ID,
        scopedPeople: buildPeopleConnection([PARIS_PERSON_ID]),
      },
    },
  });

  return cache;
};

const readCachedPeopleIds = (cache: ReturnType<typeof buildCache>) =>
  cache
    .readQuery<{
      company: { people: { edges: { node: { id: string } }[] } };
    }>({ query: COMPANY_PEOPLE_QUERY })
    ?.company.people.edges.map(({ node }) => node.id);

const readCachedScopedPeople = (cache: ReturnType<typeof buildCache>) =>
  cache.readQuery({
    query: COMPANY_SCOPED_PEOPLE_QUERY,
    variables: RELATION_ARGUMENTS,
  });

const commonEffectArguments = {
  targetObjectMetadataItem: companyObjectMetadataItem,
  fieldNameOnTargetRecord: 'people',
  targetRecordId: COMPANY_ID,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId: {},
  upsertRecordsInStore,
};

describe('relations with arguments in the optimistic effects', () => {
  it.each([
    {
      change: 'a record is attached',
      runEffect: (cache: ReturnType<typeof buildCache>) =>
        triggerAttachRelationOptimisticEffect({
          ...commonEffectArguments,
          cache,
          sourceObjectNameSingular: 'person',
          sourceRecord: buildPerson({ id: NEW_PERSON_ID, city: 'Paris' }),
        }),
      expectedPeopleIds: [PARIS_PERSON_ID, NEW_PERSON_ID],
    },
    {
      change: 'a record is detached',
      runEffect: (cache: ReturnType<typeof buildCache>) =>
        triggerDetachRelationOptimisticEffect({
          ...commonEffectArguments,
          cache,
          sourceObjectNameSingular: 'person',
          sourceRecordId: PARIS_PERSON_ID,
        }),
      expectedPeopleIds: [],
    },
    {
      change: 'an attached record changes',
      runEffect: (cache: ReturnType<typeof buildCache>) =>
        triggerUpdateRelationsOptimisticEffect({
          cache,
          sourceObjectMetadataItem: personObjectMetadataItem,
          currentSourceRecord: buildPerson({
            id: PARIS_PERSON_ID,
            city: 'Paris',
          }),
          updatedSourceRecord: buildPerson({
            id: PARIS_PERSON_ID,
            city: 'London',
          }),
          objectMetadataItems,
          objectPermissionsByObjectMetadataId: {},
          upsertRecordsInStore,
        }),
      expectedPeopleIds: [PARIS_PERSON_ID],
    },
  ])(
    'drops the cached copies with arguments when $change, and updates the plain relation as before',
    ({ runEffect, expectedPeopleIds }) => {
      const cache = buildCache();

      runEffect(cache);

      expect(readCachedScopedPeople(cache)).toBeNull();
      expect(readCachedPeopleIds(cache)).toEqual(expectedPeopleIds);
    },
  );
});
