import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';

const expectedQueryTemplate = `
query FindOnePerson($objectRecordId: ID!) {
  person(filter: { id: { eq: $objectRecordId } }) {
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

describe('useFindOneRecordQuery', () => {
  it('should return a valid findOneRecordQuery', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useFindOneRecordQuery({
          objectNameSingular,
        }),
      {
        wrapper: RecoilRoot,
      },
    );

    const { findOneRecordQuery } = result.current;

    expect(findOneRecordQuery).toBeDefined();

    const printedReceivedQuery = print(findOneRecordQuery).replace(/\s/g, '');

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });
});
