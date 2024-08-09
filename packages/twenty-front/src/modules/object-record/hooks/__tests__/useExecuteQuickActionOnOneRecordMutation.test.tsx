import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { PERSON_FRAGMENT } from '@/object-record/hooks/__mocks__/personFragment';
import { useExecuteQuickActionOnOneRecordMutation } from '@/object-record/hooks/useExecuteQuickActionOnOneRecordMutation';

const expectedQueryTemplate = `
  mutation ExecuteQuickActionOnOnePerson($idToExecuteQuickActionOn: ID!) {
    executeQuickActionOnPerson(id: $idToExecuteQuickActionOn) {
      ${PERSON_FRAGMENT}
    }
  }
`.replace(/\s/g, '');

describe('useExecuteQuickActionOnOneRecordMutation', () => {
  it('should return a valid executeQuickActionOnOneRecordMutation', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useExecuteQuickActionOnOneRecordMutation({
          objectNameSingular,
        }),
      {
        wrapper: RecoilRoot,
      },
    );

    const { executeQuickActionOnOneRecordMutation } = result.current;

    expect(executeQuickActionOnOneRecordMutation).toBeDefined();

    const printedReceivedQuery = print(
      executeQuickActionOnOneRecordMutation,
    ).replace(/\s/g, '');

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });
});
