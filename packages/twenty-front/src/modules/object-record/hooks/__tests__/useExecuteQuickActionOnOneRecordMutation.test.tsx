import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useExecuteQuickActionOnOneRecordMutation } from '@/object-record/hooks/useExecuteQuickActionOnOneRecordMutation';

const expectedQueryTemplate = `
  mutation ExecuteQuickActionOnOnePerson($idToExecuteQuickActionOn: UUID!) {
    executeQuickActionOnPerson(id: $idToExecuteQuickActionOn) {
      __typename
      xLink {
        label
        url
      }
      id
      createdAt
      city
      email
      jobTitle
      name {
        firstName
        lastName
      }
      phone
      linkedinLink {
        label
        url
      }
      updatedAt
      avatarUrl
      companyId
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
