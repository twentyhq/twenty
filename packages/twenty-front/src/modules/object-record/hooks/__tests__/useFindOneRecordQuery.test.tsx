import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { PERSON_FRAGMENT } from '@/object-record/hooks/__mocks__/personFragment';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';

const expectedQueryTemplate = `
query FindOnePerson($objectRecordId: ID!) {
  person(filter: { id: { eq: $objectRecordId } }) {
      ${PERSON_FRAGMENT}
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
