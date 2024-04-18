import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useCreateManyRecordsMutation } from '@/object-record/hooks/useCreateManyRecordsMutation';

const expectedQueryTemplate = `
  mutation CreatePeople($data: [PersonCreateInput!]!) {
    createPeople(data: $data) {
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

describe('useCreateManyRecordsMutation', () => {
  it('should return a valid createManyRecordsMutation', () => {
    const objectNameSingular = 'person';
    const depth = 2;

    const { result } = renderHook(
      () =>
        useCreateManyRecordsMutation({
          objectNameSingular,
          depth,
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
