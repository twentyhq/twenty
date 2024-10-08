import { renderHook } from '@testing-library/react';
import { print } from 'graphql';

import { useDeleteManyRecordsMutation } from '@/object-record/hooks/useDeleteManyRecordsMutation';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const expectedQueryTemplate = `
  mutation DeleteManyPeople($filter: PersonFilterInput!) {
    deletePeople(filter: $filter) {
      id
    }
  }
`.replace(/\s/g, '');

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useDeleteManyRecordsMutation', () => {
  it('should return a valid deleteManyRecordsMutation', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useDeleteManyRecordsMutation({
          objectNameSingular,
        }),
      {
        wrapper: Wrapper,
      },
    );

    const { deleteManyRecordsMutation } = result.current;

    expect(deleteManyRecordsMutation).toBeDefined();

    const printedReceivedQuery = print(deleteManyRecordsMutation).replace(
      /\s/g,
      '',
    );

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });
});
