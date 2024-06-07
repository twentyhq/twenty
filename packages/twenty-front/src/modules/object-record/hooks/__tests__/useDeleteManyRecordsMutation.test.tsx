import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useDeleteManyRecordsMutation } from '@/object-record/hooks/useDeleteManyRecordsMutation';

const expectedQueryTemplate = `
  mutation DeleteManyPeople($filter: PersonFilterInput!) {
    deletePeople(filter: $filter) {
      id
    }
  }
`.replace(/\s/g, '');

describe('useDeleteManyRecordsMutation', () => {
  it('should return a valid deleteManyRecordsMutation', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useDeleteManyRecordsMutation({
          objectNameSingular,
        }),
      {
        wrapper: RecoilRoot,
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
