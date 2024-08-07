import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useCreateManyRecordsMutation } from '@/object-record/hooks/useCreateManyRecordsMutation';

const expectedQueryTemplate = `
  mutation CreatePeople($data: [PersonCreateInput!]!, $upsert: Boolean) {
    createPeople(data: $data, upsert: $upsert) {
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

describe('useCreateManyRecordsMutation', () => {
  it('should return a valid createManyRecordsMutation', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useCreateManyRecordsMutation({
          objectNameSingular,
        }),
      {
        wrapper: RecoilRoot,
      },
    );

    const { createManyRecordsMutation } = result.current;

    expect(createManyRecordsMutation).toBeDefined();

    const printedReceivedQuery = print(createManyRecordsMutation).replace(
      /\s/g,
      '',
    );

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });
});
