import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';

const expectedQueryTemplate = `
mutation UpdateOnePerson($idToUpdate: UUID!, $input: PersonUpdateInput!) {
  updatePerson(id: $idToUpdate, data: $input) {
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

describe('useUpdateOneRecordMutation', () => {
  it('should return a valid createManyRecordsMutation', () => {
    const objectNameSingular = 'person';
    const depth = 2;

    const { result } = renderHook(
      () =>
        useUpdateOneRecordMutation({
          objectNameSingular,
          depth,
        }),
      {
        wrapper: RecoilRoot,
      },
    );

    const { updateOneRecordMutation } = result.current;

    expect(updateOneRecordMutation).toBeDefined();

    const printedReceivedQuery = print(updateOneRecordMutation).replace(
      /\s/g,
      '',
    );

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });
});
