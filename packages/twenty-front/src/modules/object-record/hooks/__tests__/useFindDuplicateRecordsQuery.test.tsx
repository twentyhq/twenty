import { renderHook } from '@testing-library/react';
import { print } from 'graphql';

import { PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS } from '@/object-record/hooks/__mocks__/personFragments';
import { useFindDuplicateRecordsQuery } from '@/object-record/hooks/useFindDuplicatesRecordsQuery';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const expectedQueryTemplate = `
  query FindDuplicatePerson($ids: [UUID!], $data: [PersonCreateInput!]) {
    personDuplicates(ids: $ids, data: $data) {
      edges {
        node {
      ${PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS}
        }
       cursor
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
     }
    }
`.replace(/\s/g, '');

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useFindDuplicateRecordsQuery', () => {
  it('should return a valid findDuplicateRecordsQuery', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useFindDuplicateRecordsQuery({
          objectNameSingular,
        }),
      {
        wrapper: Wrapper,
      },
    );

    const { findDuplicateRecordsQuery } = result.current;

    expect(findDuplicateRecordsQuery).toBeDefined();

    const printedReceivedQuery = print(findDuplicateRecordsQuery).replace(
      /\s/g,
      '',
    );

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });

  it('should expose a create-input variable for unsaved duplicate checks', () => {
    const objectNameSingular = 'company';

    const { result } = renderHook(
      () =>
        useFindDuplicateRecordsQuery({
          objectNameSingular,
        }),
      {
        wrapper: Wrapper,
      },
    );

    const printedReceivedQuery = print(result.current.findDuplicateRecordsQuery);

    expect(printedReceivedQuery).toContain(
      'query FindDuplicateCompany($ids: [UUID!], $data: [CompanyCreateInput!])',
    );
    expect(printedReceivedQuery).toContain(
      'companyDuplicates(ids: $ids, data: $data)',
    );
  });
});
