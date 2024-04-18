import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';

const expectedQueryTemplate = `
  mutation CreateOnePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
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

describe('useCreateOneRecordMutation', () => {
  it('should return a valid createOneRecordMutation', () => {
    const objectNameSingular = 'person';
    const depth = 2;

    const { result } = renderHook(
      () =>
        useCreateOneRecordMutation({
          objectNameSingular,
          depth,
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
