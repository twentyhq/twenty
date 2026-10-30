import { renderHook } from '@testing-library/react';

import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useUpdateFrontComponentApolloCache } from '@/front-components/hooks/useUpdateFrontComponentApolloCache';
import { type FrontComponent } from '~/generated-metadata/graphql';

const mockUpdateQuery = jest.fn();
const mockApolloClient = {
  cache: { updateQuery: mockUpdateQuery },
};

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => mockApolloClient,
}));

const FRONT_COMPONENT_ID = 'fc-test-id';

const buildFrontComponentRecord = (
  overrides: Partial<FrontComponent> = {},
): FrontComponent =>
  ({
    id: FRONT_COMPONENT_ID,
    name: 'Test Component',
    __typename: 'FrontComponent',
    ...overrides,
  }) as FrontComponent;

describe('useUpdateFrontComponentApolloCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call cache.updateQuery when operation is update and record ID matches', () => {
    const { result } = renderHook(() =>
      useUpdateFrontComponentApolloCache({
        frontComponentId: FRONT_COMPONENT_ID,
      }),
    );

    const detail: MetadataOperationBrowserEventDetail<FrontComponent> = {
      metadataName: 'frontComponent' as never,
      operation: {
        type: 'update',
        updatedRecord: buildFrontComponentRecord(),
      },
    };

    result.current.updateFrontComponentApolloCache(detail);

    expect(mockUpdateQuery).toHaveBeenCalledTimes(1);
  });

  it('should not call cache.updateQuery when operation type is create', () => {
    const { result } = renderHook(() =>
      useUpdateFrontComponentApolloCache({
        frontComponentId: FRONT_COMPONENT_ID,
      }),
    );

    const detail: MetadataOperationBrowserEventDetail<FrontComponent> = {
      metadataName: 'frontComponent' as never,
      operation: {
        type: 'create',
        createdRecord: buildFrontComponentRecord(),
      },
    };

    result.current.updateFrontComponentApolloCache(detail);

    expect(mockUpdateQuery).not.toHaveBeenCalled();
  });

  it('should not call cache.updateQuery when operation type is delete', () => {
    const { result } = renderHook(() =>
      useUpdateFrontComponentApolloCache({
        frontComponentId: FRONT_COMPONENT_ID,
      }),
    );

    const detail: MetadataOperationBrowserEventDetail<FrontComponent> = {
      metadataName: 'frontComponent' as never,
      operation: {
        type: 'delete',
        deletedRecordId: FRONT_COMPONENT_ID,
      },
    };

    result.current.updateFrontComponentApolloCache(detail);

    expect(mockUpdateQuery).not.toHaveBeenCalled();
  });

  it('should not call cache.updateQuery when updatedRecord ID does not match frontComponentId', () => {
    const { result } = renderHook(() =>
      useUpdateFrontComponentApolloCache({
        frontComponentId: FRONT_COMPONENT_ID,
      }),
    );

    const detail: MetadataOperationBrowserEventDetail<FrontComponent> = {
      metadataName: 'frontComponent' as never,
      operation: {
        type: 'update',
        updatedRecord: buildFrontComponentRecord({ id: 'other-id' as never }),
      },
    };

    result.current.updateFrontComponentApolloCache(detail);

    expect(mockUpdateQuery).not.toHaveBeenCalled();
  });

  it('should merge updatedRecord into existing cache data', () => {
    const { result } = renderHook(() =>
      useUpdateFrontComponentApolloCache({
        frontComponentId: FRONT_COMPONENT_ID,
      }),
    );

    const updatedRecord = buildFrontComponentRecord({
      name: 'Updated Name' as never,
    });

    const detail: MetadataOperationBrowserEventDetail<FrontComponent> = {
      metadataName: 'frontComponent' as never,
      operation: {
        type: 'update',
        updatedRecord,
      },
    };

    result.current.updateFrontComponentApolloCache(detail);

    const updaterFn = mockUpdateQuery.mock.calls[0][1];

    const existingData = {
      frontComponent: {
        id: FRONT_COMPONENT_ID,
        name: 'Old Name',
        __typename: 'FrontComponent' as const,
      },
    };

    const updatedData = updaterFn(existingData);

    expect(updatedData).toEqual({
      frontComponent: {
        ...existingData.frontComponent,
        ...updatedRecord,
      },
    });
  });

  it('should return existing data when frontComponent is not in cache', () => {
    const { result } = renderHook(() =>
      useUpdateFrontComponentApolloCache({
        frontComponentId: FRONT_COMPONENT_ID,
      }),
    );

    const detail: MetadataOperationBrowserEventDetail<FrontComponent> = {
      metadataName: 'frontComponent' as never,
      operation: {
        type: 'update',
        updatedRecord: buildFrontComponentRecord(),
      },
    };

    result.current.updateFrontComponentApolloCache(detail);

    const updaterFn = mockUpdateQuery.mock.calls[0][1];
    const existingData = { frontComponent: null };
    const updatedData = updaterFn(existingData);

    expect(updatedData).toEqual(existingData);
  });
});
