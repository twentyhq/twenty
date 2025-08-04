import { renderHook } from '@testing-library/react';

import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

// Split into tests for each new hook
describe('useObjectMetadataItem', () => {
  const opportunityObjectMetadata = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'opportunity',
  );
  it('should return correct properties', async () => {
    const { result } = renderHook(
      () => useObjectMetadataItem({ objectNameSingular: 'opportunity' }),
      {
        wrapper: Wrapper,
      },
    );

    const { objectMetadataItem } = result.current;

    expect(objectMetadataItem.id).toBe(opportunityObjectMetadata?.id);
  });

  it('should throw an error when invalid object name singular is provided', async () => {
    expect(() =>
      renderHook(
        () => useObjectMetadataItem({ objectNameSingular: 'invalid-object' }),
        {
          wrapper: Wrapper,
        },
      ),
    ).toThrow(ObjectMetadataItemNotFoundError);
  });
});
