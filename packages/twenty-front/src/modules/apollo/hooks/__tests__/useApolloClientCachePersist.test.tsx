import { InMemoryCache } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';

const mockRestore = jest.fn();
const mockPurge = jest.fn();

jest.mock('apollo3-cache-persist', () => ({
  CachePersistor: jest.fn().mockImplementation(() => ({
    restore: mockRestore,
    purge: mockPurge,
  })),
  LocalStorageWrapper: jest.fn(),
}));

import { useApolloClientCachePersist } from '@/apollo/hooks/useApolloClientCachePersist';

describe('useApolloClientCachePersist', () => {
  let cache: InMemoryCache;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRestore.mockResolvedValue(undefined);
    mockPurge.mockResolvedValue(undefined);
    cache = new InMemoryCache();
    localStorage.clear();
  });

  it('should restore cache and set isRestored to true', async () => {
    const { result } = renderHook(() => useApolloClientCachePersist(cache));

    expect(result.current.isRestored).toBe(false);

    await waitFor(() => {
      expect(result.current.isRestored).toBe(true);
    });

    expect(mockRestore).toHaveBeenCalledTimes(1);
  });

  it('should purge and recover when restore fails', async () => {
    mockRestore.mockRejectedValueOnce(new Error('Corrupt cache'));

    const { result } = renderHook(() => useApolloClientCachePersist(cache));

    await waitFor(() => {
      expect(result.current.isRestored).toBe(true);
    });

    expect(mockRestore).toHaveBeenCalledTimes(1);
    expect(mockPurge).toHaveBeenCalledTimes(1);
  });

  it('should purge persisted cache when purge is called', async () => {
    const { result } = renderHook(() => useApolloClientCachePersist(cache));

    await waitFor(() => {
      expect(result.current.isRestored).toBe(true);
    });

    await act(async () => {
      await result.current.purge();
    });

    expect(mockPurge).toHaveBeenCalled();
  });

  it('should not re-restore on re-render with same cache', async () => {
    const { result, rerender } = renderHook(() =>
      useApolloClientCachePersist(cache),
    );

    await waitFor(() => {
      expect(result.current.isRestored).toBe(true);
    });

    rerender();

    expect(mockRestore).toHaveBeenCalledTimes(1);
  });
});
