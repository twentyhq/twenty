import { renderHook } from '@testing-library/react';

import { useGetObjectOrderByField } from '@/object-metadata/hooks/useGetObjectOrderByField';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useGetObjectOrderByField', () => {
  it('should work as expected', () => {
    const { result } = renderHook(
      () => {
        const { getObjectOrderByField } = useGetObjectOrderByField({
          objectNameSingular: 'person',
        });

        return getObjectOrderByField('AscNullsLast');
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current).toEqual([
      { name: { firstName: 'AscNullsLast', lastName: 'AscNullsLast' } },
    ]);
  });
});
