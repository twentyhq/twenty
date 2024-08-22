import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { PERSON_FRAGMENT } from '@/object-record/hooks/__mocks__/personFragment';
import { useCreateManyRecordsMutation } from '@/object-record/hooks/useCreateManyRecordsMutation';

const expectedQueryTemplate = `
  mutation CreatePeople($data: [PersonCreateInput!]!, $upsert: Boolean) {
    createPeople(data: $data, upsert: $upsert) {
      ${PERSON_FRAGMENT}
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
