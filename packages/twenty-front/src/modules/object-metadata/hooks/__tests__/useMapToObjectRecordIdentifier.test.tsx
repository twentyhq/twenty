import { renderHook } from '@testing-library/react';

import { useMapToObjectRecordIdentifier } from '@/object-metadata/hooks/useMapToObjectRecordIdentifier';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useMapToObjectRecordIdentifier', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const { mapToObjectRecordIdentifier } = useMapToObjectRecordIdentifier({
          objectNameSingular: 'person',
        });

        return mapToObjectRecordIdentifier({
          id: 'id',
          name: { firstName: 'Sheldon', lastName: 'Cooper' },
          __typename: 'Person',
        });
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current).toEqual({
      id: 'id',
      name: 'Sheldon Cooper',
      avatarUrl: '',
      avatarType: 'rounded',
      linkToShowPage: '/object/person/id',
    });
  });
});
