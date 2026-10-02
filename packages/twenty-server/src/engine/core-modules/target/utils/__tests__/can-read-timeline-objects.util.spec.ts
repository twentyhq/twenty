import { type ObjectPermissions } from 'twenty-shared/types';

import { canReadTimelineObjects } from 'src/engine/core-modules/target/utils/can-read-timeline-objects.util';

const OBJECT_ID_BY_NAME_SINGULAR = {
  messageThread: 'message-thread-object-id',
  message: 'message-object-id',
};

const buildObjectPermissions = (
  canReadObjectRecords: boolean,
): ObjectPermissions => ({
  canReadObjectRecords,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
});

describe('canReadTimelineObjects', () => {
  it('allows when every timeline object is readable', () => {
    expect(
      canReadTimelineObjects({
        timelineObjectNamesSingular: ['messageThread', 'message'],
        objectIdByNameSingular: OBJECT_ID_BY_NAME_SINGULAR,
        objectRecordsPermissions: {
          'message-thread-object-id': buildObjectPermissions(true),
          'message-object-id': buildObjectPermissions(true),
        },
      }),
    ).toBe(true);
  });

  it('denies when one timeline object is not readable', () => {
    expect(
      canReadTimelineObjects({
        timelineObjectNamesSingular: ['messageThread', 'message'],
        objectIdByNameSingular: OBJECT_ID_BY_NAME_SINGULAR,
        objectRecordsPermissions: {
          'message-thread-object-id': buildObjectPermissions(true),
          'message-object-id': buildObjectPermissions(false),
        },
      }),
    ).toBe(false);
  });

  it('denies when the role has no permission entry for a timeline object', () => {
    expect(
      canReadTimelineObjects({
        timelineObjectNamesSingular: ['messageThread', 'message'],
        objectIdByNameSingular: OBJECT_ID_BY_NAME_SINGULAR,
        objectRecordsPermissions: {
          'message-thread-object-id': buildObjectPermissions(true),
        },
      }),
    ).toBe(false);
  });

  it('denies when a timeline object does not exist in the workspace', () => {
    expect(
      canReadTimelineObjects({
        timelineObjectNamesSingular: ['calendarEvent'],
        objectIdByNameSingular: OBJECT_ID_BY_NAME_SINGULAR,
        objectRecordsPermissions: {},
      }),
    ).toBe(false);
  });
});
