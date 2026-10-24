import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';

import { rebuildEventDiffFromRecords } from 'src/engine/api/common/common-record-visibility/utils/rebuild-event-diff-from-records.util';

describe('rebuildEventDiffFromRecords', () => {
  it('should take the diff values from the before and after records', () => {
    const updatedEvent: ObjectRecordUpdateEvent = {
      recordId: 'record-id',
      properties: {
        updatedFields: ['title'],
        before: { title: 'Masked' },
        after: { title: 'Masked' },
        diff: { title: { before: 'Old title', after: 'New title' } },
      },
    };

    expect(rebuildEventDiffFromRecords(updatedEvent).properties.diff).toEqual({
      title: { before: 'Masked', after: 'Masked' },
    });
  });

  it('should keep diff entries whose field is not in the records', () => {
    const updatedEvent: ObjectRecordUpdateEvent = {
      recordId: 'record-id',
      properties: {
        updatedFields: ['title'],
        before: {},
        after: {},
        diff: { title: { before: 'Old title', after: 'New title' } },
      },
    };

    expect(rebuildEventDiffFromRecords(updatedEvent).properties.diff).toEqual({
      title: { before: 'Old title', after: 'New title' },
    });
  });
});
