import { renderHook } from '@testing-library/react';
import { print } from 'graphql';

import { useDeleteOneRecordMutation } from '@/object-record/hooks/useDeleteOneRecordMutation';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const expectedQueryTemplate = `
  mutation DeleteOnePerson($idToDelete: UUID!) {
    deletePerson(id: $idToDelete) {
      __typename
      deletedAt
      id
    }
  }
`.replace(/\s/g, '');

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useDeleteOneRecordMutation', () => {
  it('should return a valid deleteOneRecordMutation', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useDeleteOneRecordMutation({
          objectNameSingular,
        }),
      {
        wrapper: Wrapper,
      },
    );

    const { deleteOneRecordMutation } = result.current;

    expect(deleteOneRecordMutation).toBeDefined();

    const printedReceivedQuery = print(deleteOneRecordMutation).replace(
      /\s/g,
      '',
    );

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });
});
