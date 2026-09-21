import { renderHook } from '@testing-library/react';

import { useLinkedRecordsIdentifiers } from '@/activities/timeline-activities/hooks/useLinkedRecordsIdentifiers';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

const linkedRecordsResult = {
  notes: [{ id: 'note-id', __typename: 'Note', title: 'Quarterly plan' }],
};

jest.mock(
  '@/object-record/multiple-objects/hooks/useCombinedFindManyRecords',
  () => ({
    useCombinedFindManyRecords: () => ({
      loading: false,
      result: linkedRecordsResult,
    }),
  }),
);

describe('useLinkedRecordsIdentifiers', () => {
  it('returns fetched identifiers for collapsed-row store hydration', () => {
    const { result } = renderHook(() =>
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

    expect(result.current.result).toEqual(linkedRecordsResult);
  });
});
