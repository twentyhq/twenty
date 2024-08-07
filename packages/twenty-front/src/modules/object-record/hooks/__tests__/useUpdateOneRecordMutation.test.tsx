import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { normalizeGQLQuery } from '~/utils/normalizeGQLQuery';

const expectedQueryTemplate = `
mutation UpdateOnePerson($idToUpdate: ID!, $input: PersonUpdateInput!) {
  updatePerson(id: $idToUpdate, data: $input) {
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
}`;

describe('useUpdateOneRecordMutation', () => {
  it('should return a valid createManyRecordsMutation', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useUpdateOneRecordMutation({
          objectNameSingular,
        }),
      {
        wrapper: RecoilRoot,
      },
    );

    const { updateOneRecordMutation } = result.current;

    expect(updateOneRecordMutation).toBeDefined();

    const printedReceivedQuery = print(updateOneRecordMutation);

    expect(normalizeGQLQuery(printedReceivedQuery)).toEqual(
      normalizeGQLQuery(expectedQueryTemplate),
    );
  });
});
