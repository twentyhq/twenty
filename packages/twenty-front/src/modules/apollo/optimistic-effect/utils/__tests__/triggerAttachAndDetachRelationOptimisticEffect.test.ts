import { gql } from '@apollo/client';

import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { InMemoryTestingCacheInstance } from '~/testing/cache/inMemoryTestingCacheInstance';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const personObjectMetadataItem = objectMetadataItems.find(
  ({ nameSingular }) => nameSingular === 'person',
)!;

const opportunityObjectMetadataItem = objectMetadataItems.find(
  ({ nameSingular }) => nameSingular === 'opportunity',
)!;

const PERSON_ID = '20202020-2d40-4e49-8df4-9c6a049190ef';
const OPPORTUNITY_ID = '20202020-83f4-4c4f-95c1-b7be9f2d36d1';
const OTHER_OPPORTUNITY_ID = '20202020-0000-4000-8000-000000000001';

const opportunityRecord: ObjectRecord = {
  __typename: 'Opportunity',
  id: OPPORTUNITY_ID,
  name: 'Opportunity',
  pointOfContactId: PERSON_ID,
};

const PEOPLE_QUERY = gql`
  query People($filter: PersonFilterInput) {
    people(filter: $filter) {
      __typename
      edges {
        __typename
        node {
          __typename
          id
        }
        cursor
      }
      totalCount
    }
  }
`;

const buildPeopleQueryVariables = (opportunityId: string) => ({
  filter: { pointOfContactForOpportunities: { id: { eq: opportunityId } } },
});

const upsertRecordsInStore = jest.fn();

const buildCache = ({
  personRecord,
  cachedPeopleIdsByOpportunityId,
}: {
  personRecord: ObjectRecord;
  cachedPeopleIdsByOpportunityId: Record<string, string[]>;
}) => {
  const { cache } = new InMemoryTestingCacheInstance({
    objectMetadataItems,
    initialRecordsInCache: [
      { objectMetadataItem: personObjectMetadataItem, records: [personRecord] },
      {
        objectMetadataItem: opportunityObjectMetadataItem,
        records: [opportunityRecord],
      },
    ],
  });

  Object.entries(cachedPeopleIdsByOpportunityId).forEach(
    ([opportunityId, peopleIds]) => {
      cache.writeQuery({
        query: PEOPLE_QUERY,
        variables: buildPeopleQueryVariables(opportunityId),
        data: {
          people: {
            __typename: 'PersonConnection',
            edges: peopleIds.map((personId) => ({
              __typename: 'PersonEdge',
              node: { __typename: 'Person', id: personId },
              cursor: '',
            })),
            totalCount: peopleIds.length,
          },
        },
      });
    },
  );

  return cache;
};

const readCachedPeople = (
  cache: ReturnType<typeof buildCache>,
  opportunityId: string,
) => {
  const result = cache.readQuery<{
    people: { edges: { node: { id: string } }[]; totalCount: number };
  }>({
    query: PEOPLE_QUERY,
    variables: buildPeopleQueryVariables(opportunityId),
  });

  return {
    peopleIds: result?.people.edges.map(({ node }) => node.id),
    totalCount: result?.people.totalCount,
  };
};

const attachOpportunityToPerson = (cache: ReturnType<typeof buildCache>) =>
  triggerAttachRelationOptimisticEffect({
    cache,
    sourceObjectNameSingular: 'opportunity',
    sourceRecord: opportunityRecord,
    targetObjectMetadataItem: personObjectMetadataItem,
    fieldNameOnTargetRecord: 'pointOfContactForOpportunities',
    targetRecordId: PERSON_ID,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId: {},
    upsertRecordsInStore,
  });

const detachOpportunityFromPerson = (cache: ReturnType<typeof buildCache>) =>
  triggerDetachRelationOptimisticEffect({
    cache,
    sourceObjectNameSingular: 'opportunity',
    sourceRecordId: OPPORTUNITY_ID,
    targetObjectMetadataItem: personObjectMetadataItem,
    fieldNameOnTargetRecord: 'pointOfContactForOpportunities',
    targetRecordId: PERSON_ID,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId: {},
    upsertRecordsInStore,
  });

describe('relation attach and detach optimistic effects', () => {
  beforeEach(() => {
    upsertRecordsInStore.mockClear();
  });

  it('adds the target to the cached lists it now matches', () => {
    const cache = buildCache({
      personRecord: {
        __typename: 'Person',
        id: PERSON_ID,
        pointOfContactForOpportunities: [],
      },
      cachedPeopleIdsByOpportunityId: {
        [OPPORTUNITY_ID]: [],
        [OTHER_OPPORTUNITY_ID]: [],
      },
    });

    attachOpportunityToPerson(cache);

    expect(readCachedPeople(cache, OPPORTUNITY_ID)).toEqual({
      peopleIds: [PERSON_ID],
      totalCount: 1,
    });
    expect(readCachedPeople(cache, OTHER_OPPORTUNITY_ID)).toEqual({
      peopleIds: [],
      totalCount: 0,
    });
  });

  it('adds a target fetched without the relation field to the cached lists it now matches', () => {
    const cache = buildCache({
      personRecord: { __typename: 'Person', id: PERSON_ID },
      cachedPeopleIdsByOpportunityId: { [OPPORTUNITY_ID]: [] },
    });

    attachOpportunityToPerson(cache);

    expect(readCachedPeople(cache, OPPORTUNITY_ID)).toEqual({
      peopleIds: [PERSON_ID],
      totalCount: 1,
    });
  });

  it('leaves a cached list untouched when the target was already in it', () => {
    const cache = buildCache({
      personRecord: {
        __typename: 'Person',
        id: PERSON_ID,
        pointOfContactForOpportunities: [opportunityRecord],
      },
      cachedPeopleIdsByOpportunityId: { [OPPORTUNITY_ID]: [PERSON_ID] },
    });

    attachOpportunityToPerson(cache);

    expect(readCachedPeople(cache, OPPORTUNITY_ID)).toEqual({
      peopleIds: [PERSON_ID],
      totalCount: 1,
    });
  });

  it('removes the target from the cached lists it no longer matches', () => {
    const cache = buildCache({
      personRecord: {
        __typename: 'Person',
        id: PERSON_ID,
        pointOfContactForOpportunities: [opportunityRecord],
      },
      cachedPeopleIdsByOpportunityId: { [OPPORTUNITY_ID]: [PERSON_ID] },
    });

    detachOpportunityFromPerson(cache);

    expect(readCachedPeople(cache, OPPORTUNITY_ID)).toEqual({
      peopleIds: [],
      totalCount: 0,
    });
  });

  it('removes a target cached without the relation field from the cached lists it was in', () => {
    const cache = buildCache({
      personRecord: { __typename: 'Person', id: PERSON_ID },
      cachedPeopleIdsByOpportunityId: { [OPPORTUNITY_ID]: [PERSON_ID] },
    });

    detachOpportunityFromPerson(cache);

    expect(readCachedPeople(cache, OPPORTUNITY_ID)).toEqual({
      peopleIds: [],
      totalCount: 0,
    });
  });

  it('does nothing when the target is not cached', () => {
    const cache = buildCache({
      personRecord: { __typename: 'Person', id: OTHER_OPPORTUNITY_ID },
      cachedPeopleIdsByOpportunityId: { [OPPORTUNITY_ID]: [] },
    });

    attachOpportunityToPerson(cache);

    expect(readCachedPeople(cache, OPPORTUNITY_ID)).toEqual({
      peopleIds: [],
      totalCount: 0,
    });
    expect(upsertRecordsInStore).not.toHaveBeenCalled();
  });
});
