import { renderHook } from '@testing-library/react';
import { print } from 'graphql';

import { PERSON_FRAGMENT_WITH_DEPTH_ONE_RELATIONS } from '@/object-record/hooks/__mocks__/personFragments';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const expectedQueryTemplate = `
  mutation CreateOnePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
      ${PERSON_FRAGMENT_WITH_DEPTH_ONE_RELATIONS}
    }
  }
`.replace(/\s/g, '');

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useCreateOneRecordMutation', () => {
  it('should return a valid createOneRecordMutation', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useCreateOneRecordMutation({
          objectNameSingular,
        }),
      {
        wrapper: Wrapper,
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
