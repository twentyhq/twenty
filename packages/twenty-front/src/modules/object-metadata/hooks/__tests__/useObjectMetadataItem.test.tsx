import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { vi } from 'vitest';

import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getHookErrorBoundaryWrapper } from '~/testing/test-helpers/getHookErrorBoundaryWrapper';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const MetadataWrapper = getTestMetadataAndApolloMocksWrapper({
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
        wrapper: MetadataWrapper,
      },
    );

    const { objectMetadataItem } = result.current;

    expect(objectMetadataItem.id).toBe(opportunityObjectMetadata?.id);
  });

  it('should throw an error when invalid object name singular is provided', async () => {
    const onError = vi.fn();
    const ErrorBoundaryWrapper = getHookErrorBoundaryWrapper(onError);
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <ErrorBoundaryWrapper>
        <MetadataWrapper>{children}</MetadataWrapper>
      </ErrorBoundaryWrapper>
    );

    renderHook(
      () => useObjectMetadataItem({ objectNameSingular: 'invalid-object' }),
      {
        wrapper: Wrapper,
      },
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(ObjectMetadataItemNotFoundError),
    );
  });
});
