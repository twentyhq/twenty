import { renderHook } from '@testing-library/react';

import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import { useInboxItemPagination } from '@/inbox/hooks/useInboxItemPagination';

const mockNavigate = jest.fn();

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => mockNavigate,
}));

let mockInboxItemOrder: {
  inboxSectionSlug: string;
  inboxItemIds: string[];
} | null = null;

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => mockInboxItemOrder,
}));

const renderPagination = (inboxItemId?: string) =>
  renderHook(() =>
    useInboxItemPagination({
      inboxSection: DEFAULT_INBOX_SECTION,
      inboxItemId,
    }),
  );

describe('useInboxItemPagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInboxItemOrder = {
      inboxSectionSlug: DEFAULT_INBOX_SECTION.slug,
      inboxItemIds: ['first', 'second', 'third'],
    };
  });

  it('should report its position within the snapshotted order', () => {
    // Act
    const { result } = renderPagination('second');

    // Assert
    expect(result.current.position).toBe(2);
    expect(result.current.total).toBe(3);
  });

  it('should offer both directions in the middle of the order', () => {
    // Act
    const { result } = renderPagination('second');

    // Assert
    expect(result.current.hasPrevious).toBe(true);
    expect(result.current.hasNext).toBe(true);
  });

  it('should not offer a previous item at the start', () => {
    // Act
    const { result } = renderPagination('first');

    // Assert
    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.hasNext).toBe(true);
  });

  it('should not offer a next item at the end', () => {
    // Act
    const { result } = renderPagination('third');

    // Assert
    expect(result.current.hasPrevious).toBe(true);
    expect(result.current.hasNext).toBe(false);
  });

  it('should offer no navigation for an item reached outside the order', () => {
    // Act
    const { result } = renderPagination('stranger');

    // Assert
    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.hasNext).toBe(false);
    expect(result.current.position).toBeUndefined();
    expect(result.current.total).toBeUndefined();
  });

  it('should navigate to the neighbour rather than the current item', () => {
    // Arrange
    const { result } = renderPagination('second');

    // Act
    result.current.goToNext();

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith(expect.anything(), {
      inboxSectionSlug: DEFAULT_INBOX_SECTION.slug,
      inboxItemId: 'third',
    });
  });

  it('should ignore a snapshot captured in another section', () => {
    // Arrange
    mockInboxItemOrder = {
      inboxSectionSlug: 'done',
      inboxItemIds: ['first', 'second', 'third'],
    };

    // Act
    const { result } = renderPagination('second');

    // Assert
    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.hasNext).toBe(false);
    expect(result.current.position).toBeUndefined();
  });

  it('should offer no navigation with no snapshot at all', () => {
    // Arrange
    mockInboxItemOrder = null;

    // Act
    const { result } = renderPagination('second');

    // Assert
    expect(result.current.hasNext).toBe(false);
  });

  it('should not navigate past the end of the order', () => {
    // Arrange
    const { result } = renderPagination('third');

    // Act
    result.current.goToNext();

    // Assert
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
