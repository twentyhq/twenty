import { renderHook } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { vi } from 'vitest';

import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getHookErrorBoundaryWrapper } from '~/testing/test-helpers/getHookErrorBoundaryWrapper';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const MetadataWrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useObjectMetadataItemById', () => {
  const opportunityObjectMetadata = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'opportunity',
  );

  if (!opportunityObjectMetadata) {
    throw new Error('Opportunity object metadata not found');
  }

  it('should return correct properties', async () => {
    const { result } = renderHook(
      () =>
        useObjectMetadataItemById({
          objectId: opportunityObjectMetadata.id,
        }),
      {
        wrapper: MetadataWrapper,
      },
    );

    const { objectMetadataItem } = result.current;

    expect(objectMetadataItem?.id).toBe(opportunityObjectMetadata.id);
  });

  it('should throw an error when invalid ID is provided', async () => {
    const onError = vi.fn();
    const ErrorBoundaryWrapper = getHookErrorBoundaryWrapper(onError);
    const Wrapper = ({ children }: { children: ReactNode }) =>
      React.createElement(
        ErrorBoundaryWrapper,
        null,
        React.createElement(MetadataWrapper, null, children),
      );

    renderHook(() => useObjectMetadataItemById({ objectId: 'invalid-id' }), {
      wrapper: Wrapper,
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Object metadata item not found for id invalid-id',
      }),
    );
  });
});
