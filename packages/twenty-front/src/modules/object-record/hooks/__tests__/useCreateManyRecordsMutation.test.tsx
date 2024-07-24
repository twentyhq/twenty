import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useCreateManyRecordsMutation } from '@/object-record/hooks/useCreateManyRecordsMutation';

const expectedQueryTemplate = `
  mutation CreatePeople($data: [PersonCreateInput!]!, $upsert: Boolean) {
    createPeople(data: $data, upsert: $upsert) {
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
