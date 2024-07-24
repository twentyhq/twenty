import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useExecuteQuickActionOnOneRecordMutation } from '@/object-record/hooks/useExecuteQuickActionOnOneRecordMutation';

const expectedQueryTemplate = `
  mutation ExecuteQuickActionOnOnePerson($idToExecuteQuickActionOn: ID!) {
    executeQuickActionOnPerson(id: $idToExecuteQuickActionOn) {
      __typename
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
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
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
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
