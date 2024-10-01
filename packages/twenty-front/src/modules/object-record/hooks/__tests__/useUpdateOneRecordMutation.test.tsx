import { renderHook } from '@testing-library/react';
import { print } from 'graphql';

import { PERSON_FRAGMENT } from '@/object-record/hooks/__mocks__/personFragments';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { getJestHookMockWrapper } from '~/testing/jest/getJestHookMockWrapper';
import { normalizeGQLQuery } from '~/utils/normalizeGQLQuery';

const expectedQueryTemplate = `
mutation UpdateOnePerson($idToUpdate: ID!, $input: PersonUpdateInput!) {
  updatePerson(id: $idToUpdate, data: $input) {
      ${PERSON_FRAGMENT}
  }
}`;

const Wrapper = getJestHookMockWrapper({
  apolloMocks: [],
});

describe('useUpdateOneRecordMutation', () => {
  it('should return a valid createManyRecordsMutation', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useUpdateOneRecordMutation({
          objectNameSingular,
        }),
      {
        wrapper: Wrapper,
      },
    );

    const { updateOneRecordMutation } = result.current;

    expect(updateOneRecordMutation).toBeDefined();

    const printedReceivedQuery = print(updateOneRecordMutation);

    expect(normalizeGQLQuery(printedReceivedQuery)).toEqual(
      normalizeGQLQuery(expectedQueryTemplate),
    );
  });
});
