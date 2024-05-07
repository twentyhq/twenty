import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';

const expectedQueryTemplate = `
query FindOnePerson($objectRecordId: UUID!) {
  person(filter: { id: { eq: $objectRecordId } }) {
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

describe('useFindOneRecordQuery', () => {
  it('should return a valid findOneRecordQuery', () => {
    const objectNameSingular = 'person';
    const depth = 2;

    const { result } = renderHook(
      () =>
        useFindOneRecordQuery({
          objectNameSingular,
          depth,
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
