import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { PERSON_FRAGMENT } from '@/object-record/hooks/__mocks__/personFragment';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';

const expectedQueryTemplate = `
  mutation CreateOnePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
      ${PERSON_FRAGMENT}
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
