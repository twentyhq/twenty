import { render, waitFor } from '@testing-library/react';

import { RecordListUpsertRecordsInStoreEffect } from '@/object-record/record-list/components/RecordListUpsertRecordsInStoreEffect';

const upsertRecordsInStore = jest.fn();

jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({ upsertRecordsInStore }),
}));

describe('RecordListUpsertRecordsInStoreEffect', () => {
  it('hydrates partial records for consumers of the shared record store', async () => {
    const records = [
      { id: 'note-id', __typename: 'Note', title: 'Quarterly plan' },
    ];

    render(<RecordListUpsertRecordsInStoreEffect records={records} />);

    await waitFor(() => {
      expect(upsertRecordsInStore).toHaveBeenCalledWith({
        partialRecords: records,
      });
    });
  });
});
