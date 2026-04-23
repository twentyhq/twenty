import { renderHook } from '@testing-library/react';
import { print } from 'graphql';

import { PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS } from '@/object-record/hooks/__mocks__/personFragments';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const expectedQueryTemplate = `
query FindOnePerson($objectRecordId: UUID!) {
  person(filter: { id: { eq: $objectRecordId } }) {
      ${PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS}
  }
}
`.replace(/\s/g, '');

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useFindOneRecordQuery', () => {
  it('should return a valid findOneRecordQuery', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useFindOneRecordQuery({
          objectNameSingular,
        }),
      {
        wrapper: Wrapper,
      },
    );

    const { findOneRecordQuery } = result.current;

    expect(findOneRecordQuery).toBeDefined();

    const printedReceivedQuery = print(findOneRecordQuery).replace(/\s/g, '');

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });
});
