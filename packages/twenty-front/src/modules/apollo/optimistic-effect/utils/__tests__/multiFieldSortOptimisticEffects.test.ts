import { gql, InMemoryCache } from '@apollo/client';

import { buildSortedConnectionEdges } from '@/apollo/optimistic-effect/utils/buildSortedConnectionEdges';
import { triggerUpdateRootQueriesOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRootQueriesOptimisticEffect';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const COMPANIES_QUERY = gql`
  query Companies($orderBy: [CompanyOrderByInput!]!) {
    companies(orderBy: $orderBy) {
      edges {
        cursor
        node {
          id
          employees
          position
        }
      }
      totalCount
    }
  }
`;

const COMPANY_FRAGMENT = gql`
  fragment CompanySortFields on Company {
    id
    employees
    position
  }
`;

const ORDER_BY: RecordGqlOperationOrderBy = [
  { employees: 'AscNullsLast' },
  { position: 'AscNullsLast' },
];

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const companyObjectMetadataItem = objectMetadataItems.find(
  ({ nameSingular }) => nameSingular === 'company',
)!;

const existingCompany = {
  __typename: 'Company',
  id: '20202020-0000-4000-8000-000000000001',
  employees: 10,
  position: 2,
};
const otherCompany = {
  ...existingCompany,
  id: '20202020-0000-4000-8000-000000000002',
  position: 3,
};

const buildCache = (records: (typeof existingCompany)[]) => {
  const cache = new InMemoryCache();
  cache.writeQuery({
    query: COMPANIES_QUERY,
    variables: { orderBy: ORDER_BY },
    data: {
      companies: {
        __typename: 'CompanyConnection',
        edges: records.map((record) => ({
          __typename: 'CompanyEdge',
          cursor: record.id,
          node: record,
        })),
        totalCount: records.length,
      },
    },
  });
  return cache;
};

const readCompanyIds = (cache: InMemoryCache) =>
  cache
    .readQuery<{ companies: { edges: { node: { id: string } }[] } }>({
      query: COMPANIES_QUERY,
      variables: { orderBy: ORDER_BY },
    })!
    .companies.edges.map(({ node }) => node.id);

describe('optimistic multi-field sorting', () => {
  it('inserts a new record according to the secondary sort', () => {
    const cache = buildCache([existingCompany]);
    const newCompany = { ...otherCompany, position: 1 };
    const reference = cache.writeFragment({
      fragment: COMPANY_FRAGMENT,
      data: newCompany,
    })!;

    cache.modify<{ companies: { edges: RecordGqlRefEdge[] } }>({
      fields: {
        companies: (connection, { readField }) => ({
          ...connection,
          edges: buildSortedConnectionEdges({
            currentEdges:
              readField<RecordGqlRefEdge[]>('edges', connection) ?? [],
            newEntries: [
              {
                edge: {
                  __typename: 'CompanyEdge',
                  cursor: newCompany.id,
                  node: reference,
                },
                record: newCompany,
              },
            ],
            orderBy: ORDER_BY,
            readField,
          }),
        }),
      },
    });

    expect(readCompanyIds(cache)).toEqual([newCompany.id, existingCompany.id]);
  });

  it('repositions an existing record after its secondary sort field changes', () => {
    const cache = buildCache([existingCompany, otherCompany]);
    const updatedCompany = { ...otherCompany, position: 1 };
    cache.writeFragment({ fragment: COMPANY_FRAGMENT, data: updatedCompany });

    triggerUpdateRootQueriesOptimisticEffect({
      cache,
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems,
      updatedRecords: [updatedCompany],
    });

    expect(readCompanyIds(cache)).toEqual([
      otherCompany.id,
      existingCompany.id,
    ]);
  });
});
