import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useExecuteQuickActionOnOneRecordMutation } from '@/object-record/hooks/useExecuteQuickActionOnOneRecordMutation';

const expectedQueryTemplate = `
  mutation ExecuteQuickActionOnOnePerson($idToExecuteQuickActionOn: ID!) {
    executeQuickActionOnPerson(id: $idToExecuteQuickActionOn) {
      __typename
      updatedAt
      myCustomObjectId
      whatsapp
      linkedinLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      name {
        firstName
        lastName
      }
      email
      position
      createdBy {
        source
        workspaceMemberId
        name
      }
      avatarUrl
      jobTitle
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      performanceRating
      createdAt
      phone
      id
      city
      companyId
      intro
      workPrefereance
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
