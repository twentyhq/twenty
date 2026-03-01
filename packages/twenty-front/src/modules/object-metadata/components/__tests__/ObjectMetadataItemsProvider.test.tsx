import { render, screen, waitFor, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isObjectMetadataLoadedState } from '@/object-metadata/states/isObjectMetadataLoadedState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

jest.mock('~/loading/components/UserOrMetadataLoader', () => ({
  UserOrMetadataLoader: () => (
    <div data-testid="skeleton-loader">Loading...</div>
  ),
}));

const getWrapper =
  ({
    hasItems = false,
    isLoading = false,
  }: {
    hasItems?: boolean;
    isLoading?: boolean;
  } = {}) =>
  ({ children }: { children: ReactNode }) => (
    <RecoilRoot
      initializeState={({ set }) => {
        if (hasItems) {
          set(objectMetadataItemsState, generatedMockObjectMetadataItems);
        }
        set(shouldAppBeLoadingState, isLoading);
      }}
    >
      {children}
    </RecoilRoot>
  );

describe('ObjectMetadataItemsProvider', () => {
  it('should show skeleton loader when metadata is not loaded', () => {
    render(
      <ObjectMetadataItemsProvider>
        <div data-testid="children-content">Content</div>
      </ObjectMetadataItemsProvider>,
      { wrapper: getWrapper({ hasItems: false, isLoading: false }) },
    );

    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    expect(screen.queryByTestId('children-content')).not.toBeInTheDocument();
  });

  it('should show skeleton loader when app should be loading', () => {
    render(
      <ObjectMetadataItemsProvider>
        <div data-testid="children-content">Content</div>
      </ObjectMetadataItemsProvider>,
      { wrapper: getWrapper({ hasItems: true, isLoading: true }) },
    );

    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    expect(screen.queryByTestId('children-content')).not.toBeInTheDocument();
  });

  it('should render children when metadata is loaded and app is not loading', () => {
    render(
      <ObjectMetadataItemsProvider>
        <div data-testid="children-content">Content</div>
      </ObjectMetadataItemsProvider>,
      { wrapper: getWrapper({ hasItems: true, isLoading: false }) },
    );

    expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    expect(screen.getByTestId('children-content')).toBeInTheDocument();
  });

  it('should set isObjectMetadataLoadedState to true when metadata is ready', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(objectMetadataItemsState, generatedMockObjectMetadataItems);
          set(shouldAppBeLoadingState, false);
        }}
      >
        <ObjectMetadataItemsProvider>
          <div>Content</div>
        </ObjectMetadataItemsProvider>
        {children}
      </RecoilRoot>
    );

    const { result } = renderHook(
      () => useRecoilValue(isObjectMetadataLoadedState),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should set isObjectMetadataLoadedState to false when metadata is not ready', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(objectMetadataItemsState, []);
          set(shouldAppBeLoadingState, false);
        }}
      >
        <ObjectMetadataItemsProvider>
          <div>Content</div>
        </ObjectMetadataItemsProvider>
        {children}
      </RecoilRoot>
    );

    const { result } = renderHook(
      () => useRecoilValue(isObjectMetadataLoadedState),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});
