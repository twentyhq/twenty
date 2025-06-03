import { renderHook } from '@testing-library/react';
import { print } from 'graphql';

import { PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS } from '@/object-record/hooks/__mocks__/personFragments';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { normalizeGQLQuery } from '~/utils/normalizeGQLQuery';

const expectedQueryTemplate = `
mutation UpdateOnePerson($idToUpdate: UUID!, $input: PersonUpdateInput!) {
  updatePerson(id: $idToUpdate, data: $input) {
      ${PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS}
  }
}`;

const Wrapper = getJestMetadataAndApolloMocksWrapper({
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
