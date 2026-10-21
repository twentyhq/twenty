import { act, renderHook } from '@testing-library/react';

import { useToggleEmailThreadLink } from '@/activities/emails/hooks/useToggleEmailThreadLink';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const mockCreateOneRecord = jest.fn();
const mockDeleteOneRecord = jest.fn();
const mockRefetch = jest.fn();
const mockRefetchQueries = jest.fn();
const mockUseFindManyRecords = jest.fn();

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (args: unknown) => mockUseFindManyRecords(args),
}));

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({ createOneRecord: mockCreateOneRecord }),
}));

jest.mock('@/object-record/hooks/useDeleteOneRecord', () => ({
  useDeleteOneRecord: () => ({ deleteOneRecord: mockDeleteOneRecord }),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ refetchQueries: mockRefetchQueries }),
}));

const targetRecord = {
  id: 'opportunity-id',
  targetObjectNameSingular: CoreObjectNameSingular.Opportunity,
};

const renderToggleHook = () =>
  renderHook(() =>
    useToggleEmailThreadLink({
      targetRecord,
      messageThreadTargetJoinColumnName: 'targetOpportunityId',
      messageThreadIds: ['linked-thread-id', 'unlinked-thread-id'],
    }),
  );

describe('useToggleEmailThreadLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFindManyRecords.mockReturnValue({
      records: [{ id: 'target-id', messageThreadId: 'linked-thread-id' }],
      refetch: mockRefetch,
    });
  });

  it('should only look up links between this record and the displayed threads', () => {
    renderToggleHook();

    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.MessageThreadTarget,
        filter: {
          targetOpportunityId: { eq: 'opportunity-id' },
          messageThreadId: { in: ['linked-thread-id', 'unlinked-thread-id'] },
        },
      }),
    );
  });

  it('should expose linked threads', () => {
    const { result } = renderToggleHook();

    expect(result.current.linkedMessageThreadIds.has('linked-thread-id')).toBe(
      true,
    );
    expect(
      result.current.linkedMessageThreadIds.has('unlinked-thread-id'),
    ).toBe(false);
  });

  it('should link an unlinked thread to the record', async () => {
    const { result } = renderToggleHook();

    await act(() => result.current.toggleEmailThreadLink('unlinked-thread-id'));

    expect(mockCreateOneRecord).toHaveBeenCalledWith({
      messageThreadId: 'unlinked-thread-id',
      targetOpportunityId: 'opportunity-id',
    });
    expect(mockDeleteOneRecord).not.toHaveBeenCalled();
    expect(mockRefetch).toHaveBeenCalled();
    expect(mockRefetchQueries).toHaveBeenCalled();
  });

  it('should unlink a linked thread from the record', async () => {
    const { result } = renderToggleHook();

    await act(() => result.current.toggleEmailThreadLink('linked-thread-id'));

    expect(mockDeleteOneRecord).toHaveBeenCalledWith('target-id');
    expect(mockCreateOneRecord).not.toHaveBeenCalled();
  });
});
