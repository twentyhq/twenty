import { renderHook } from '@testing-library/react';
import { print } from 'graphql';

import { PERSON_FRAGMENT } from '@/object-record/hooks/__mocks__/personFragments';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { getJestHookMockWrapper } from '~/testing/jest/getJestHookMockWrapper';

const expectedQueryTemplate = `
query FindOnePerson($objectRecordId: ID!) {
  person(filter: { id: { eq: $objectRecordId } }) {
      ${PERSON_FRAGMENT}
  }
}
`.replace(/\s/g, '');

const Wrapper = getJestHookMockWrapper({
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
