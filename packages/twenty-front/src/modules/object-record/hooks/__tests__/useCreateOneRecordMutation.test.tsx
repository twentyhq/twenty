import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';

const expectedQueryTemplate = `
  mutation CreateOnePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
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

describe('useCreateOneRecordMutation', () => {
  it('should return a valid createOneRecordMutation', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useCreateOneRecordMutation({
          objectNameSingular,
        }),
      {
        wrapper: RecoilRoot,
      },
    );

    const { createOneRecordMutation } = result.current;

    expect(createOneRecordMutation).toBeDefined();

    const printedReceivedQuery = print(createOneRecordMutation).replace(
      /\s/g,
      '',
    );

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });
});
