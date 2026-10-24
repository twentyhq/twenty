import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';

import { cloneEventRecords } from 'src/engine/api/common/common-record-visibility/utils/clone-event-records.util';

describe('cloneEventRecords', () => {
  it('should copy the before and after records so the original event is left untouched', () => {
    const updatedEvent: ObjectRecordUpdateEvent = {
      recordId: 'record-id',
      properties: {
        updatedFields: ['title'],
        before: { title: 'Old title' },
        after: { title: 'New title' },
        diff: { title: { before: 'Old title', after: 'New title' } },
      },
    };

    const clonedEvent = cloneEventRecords(updatedEvent);

    Object.assign(clonedEvent.properties.after, { title: 'Masked' });

    expect(updatedEvent.properties.after).toEqual({ title: 'New title' });
    expect(clonedEvent.properties.after).toEqual({ title: 'Masked' });
  });
});
