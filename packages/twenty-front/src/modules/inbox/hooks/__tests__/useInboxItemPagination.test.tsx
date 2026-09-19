import { renderHook } from '@testing-library/react';

import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import { INBOX_ITEM_ORDER_LOCATION_STATE } from '@/inbox/constants/InboxItemOrderLocationState';
import { useInboxItemPagination } from '@/inbox/hooks/useInboxItemPagination';

const mockNavigate = jest.fn();
let mockLocationState: unknown = INBOX_ITEM_ORDER_LOCATION_STATE;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: mockLocationState }),
}));

let mockInboxItemOrder: {
  inboxListKey: string;
  inboxItemIds: string[];
} | null = null;

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => mockInboxItemOrder,
}));

const renderPagination = (inboxItemId?: string) =>
  renderHook(() =>
    useInboxItemPagination({
      inboxListLocation: { inboxSectionSlug: DEFAULT_INBOX_SECTION.slug },
      inboxItemId,
    }),
  );

describe('useInboxItemPagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = INBOX_ITEM_ORDER_LOCATION_STATE;
    mockInboxItemOrder = {
      inboxListKey: `section:${DEFAULT_INBOX_SECTION.slug}`,
      inboxItemIds: ['first', 'second', 'third'],
    };
  });

  it('should report its position within the snapshotted order', () => {
    const { result } = renderPagination('second');

    expect(result.current.position).toBe(2);
    expect(result.current.total).toBe(3);
  });

  it('should offer both directions in the middle of the order', () => {
    const { result } = renderPagination('second');

    expect(result.current.hasPrevious).toBe(true);
    expect(result.current.hasNext).toBe(true);
  });

  it('should not offer a previous item at the start', () => {
    const { result } = renderPagination('first');

    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.hasNext).toBe(true);
  });

  it('should not offer a next item at the end', () => {
    const { result } = renderPagination('third');

    expect(result.current.hasPrevious).toBe(true);
    expect(result.current.hasNext).toBe(false);
  });

  it('should offer no navigation for an item reached outside the order', () => {
    const { result } = renderPagination('stranger');

    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.hasNext).toBe(false);
    expect(result.current.position).toBeUndefined();
    expect(result.current.total).toBeUndefined();
  });

  it('should navigate to the neighbour rather than the current item', () => {
    const { result } = renderPagination('second');

    result.current.goToNext();

    expect(mockNavigate).toHaveBeenCalledWith(
      `/inbox/${DEFAULT_INBOX_SECTION.slug}/third`,
      { state: INBOX_ITEM_ORDER_LOCATION_STATE },
    );
  });

  it('should ignore a snapshot captured in another list', () => {
    mockInboxItemOrder = {
      inboxListKey: 'section:done',
      inboxItemIds: ['first', 'second', 'third'],
    };

    const { result } = renderPagination('second');

    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.hasNext).toBe(false);
    expect(result.current.position).toBeUndefined();
  });

  it('should ignore a snapshot when the item was reached by a direct link', () => {
    mockLocationState = null;

    const { result } = renderPagination('second');

    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.hasNext).toBe(false);
    expect(result.current.position).toBeUndefined();
  });

  it('should offer no navigation with no snapshot at all', () => {
    mockInboxItemOrder = null;

    const { result } = renderPagination('second');

    expect(result.current.hasNext).toBe(false);
  });

  it('should not navigate past the end of the order', () => {
    const { result } = renderPagination('third');

    result.current.goToNext();

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
