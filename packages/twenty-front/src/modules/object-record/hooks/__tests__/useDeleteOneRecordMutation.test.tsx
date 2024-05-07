import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useDeleteOneRecordMutation } from '@/object-record/hooks/useDeleteOneRecordMutation';

const expectedQueryTemplate = `
  mutation DeleteOnePerson($idToDelete: UUID!) {
    deletePerson(id: $idToDelete) {
      id
    }
  }
`.replace(/\s/g, '');

describe('useDeleteOneRecordMutation', () => {
  it('should return a valid deleteOneRecordMutation', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useDeleteOneRecordMutation({
          objectNameSingular,
        }),
      {
        wrapper: RecoilRoot,
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
