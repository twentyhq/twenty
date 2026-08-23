import { renderHook, waitFor } from '@testing-library/react';

import { useLinkedRecordsIdentifiers } from '@/activities/timeline-activities/hooks/useLinkedRecordsIdentifiers';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

const upsertRecordsInStore = jest.fn();

jest.mock(
  '@/object-record/multiple-objects/hooks/useCombinedFindManyRecords',
  () => ({
    useCombinedFindManyRecords: () => ({
      loading: false,
      result: {
        notes: [{ id: 'note-id', __typename: 'Note', title: 'Quarterly plan' }],
      },
    }),
  }),
);

jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({ upsertRecordsInStore }),
}));

describe('useLinkedRecordsIdentifiers', () => {
  it('hydrates fetched identifiers into the record store used by collapsed rows', async () => {
    renderHook(() =>
      useLinkedRecordsIdentifiers({
        timelineActivities: [
          {
            linkedObjectMetadataId: 'note-object-id',
            linkedRecordId: 'note-id',
          } as TimelineActivity,
        ],
        objectMetadataItems: [
          {
            id: 'note-object-id',
            nameSingular: 'note',
            universalIdentifier: 'note-object-universal-identifier',
            labelIdentifierFieldMetadataId: 'title-field-id',
            fields: [{ id: 'title-field-id', name: 'title' }],
          } as EnrichedObjectMetadataItem,
        ],
      }),
    );

    await waitFor(() => {
      expect(upsertRecordsInStore).toHaveBeenCalledWith({
        partialRecords: [
          { id: 'note-id', __typename: 'Note', title: 'Quarterly plan' },
        ],
      });
    });
  });
});
