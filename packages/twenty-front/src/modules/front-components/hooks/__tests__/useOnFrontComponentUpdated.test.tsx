import { renderHook } from '@testing-library/react';

import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { AllMetadataName } from '~/generated-metadata/graphql';

const mockUseListenToEventsForQuery = jest.fn();
const mockUseListenToMetadataOperationBrowserEvent = jest.fn();
const mockUpdateFrontComponentApolloCache = jest.fn();

jest.mock('@/sse-db-event/hooks/useListenToEventsForQuery', () => ({
  useListenToEventsForQuery: (...args: unknown[]) =>
    mockUseListenToEventsForQuery(...args),
}));

jest.mock(
  '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent',
  () => ({
    useListenToMetadataOperationBrowserEvent: (...args: unknown[]) =>
      mockUseListenToMetadataOperationBrowserEvent(...args),
  }),
);

jest.mock(
  '@/front-components/hooks/useUpdateFrontComponentApolloCache',
  () => ({
    useUpdateFrontComponentApolloCache: () => ({
      updateFrontComponentApolloCache: mockUpdateFrontComponentApolloCache,
    }),
  }),
);

const FRONT_COMPONENT_ID = 'fc-test-id';

describe('useOnFrontComponentUpdated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useListenToEventsForQuery with correct queryId and operationSignature', () => {
    renderHook(() =>
      useOnFrontComponentUpdated({
        frontComponentId: FRONT_COMPONENT_ID,
      }),
    );

    expect(mockUseListenToEventsForQuery).toHaveBeenCalledWith({
      queryId: `front-component-updated-${FRONT_COMPONENT_ID}`,
      operationSignature: {
        metadataName: AllMetadataName.frontComponent,
        variables: {
          filter: { id: { eq: FRONT_COMPONENT_ID } },
        },
      },
    });
  });

  it('should call useListenToMetadataOperationBrowserEvent with frontComponent metadata name', () => {
    renderHook(() =>
      useOnFrontComponentUpdated({
        frontComponentId: FRONT_COMPONENT_ID,
      }),
    );

    expect(mockUseListenToMetadataOperationBrowserEvent).toHaveBeenCalledWith({
      metadataName: AllMetadataName.frontComponent,
      onMetadataOperationBrowserEvent: mockUpdateFrontComponentApolloCache,
    });
  });

  it('should derive queryId from frontComponentId', () => {
    const customId = 'custom-fc-123';

    renderHook(() =>
      useOnFrontComponentUpdated({
        frontComponentId: customId,
      }),
    );

    expect(mockUseListenToEventsForQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryId: `front-component-updated-${customId}`,
      }),
    );
  });
});
