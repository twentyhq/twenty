import { renderHook } from '@testing-library/react';

import { useCreateCalendarEventTargets } from '@/activities/calendar/hooks/useCreateCalendarEventTargets';

const mockCreateManyRecords = jest.fn();
const mockUseObjectMorphJunctionConfig = jest.fn();

jest.mock('@/object-record/hooks/useCreateManyRecords', () => ({
  useCreateManyRecords: () => ({ createManyRecords: mockCreateManyRecords }),
}));

jest.mock(
  '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig',
  () => ({
    useObjectMorphJunctionConfig: () => mockUseObjectMorphJunctionConfig(),
  }),
);

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

const PERSON_OBJECT_METADATA_ID = '20202020-0000-4000-8000-0000000000a1';
const CALENDAR_EVENT_ID = '20202020-0000-4000-8000-0000000000b1';
const PERSON_ID = '20202020-0000-4000-8000-0000000000c1';

const JUNCTION_CONFIG = {
  junctionObjectMetadata: { nameSingular: 'calendarEventTarget' },
  sourceJoinColumnName: 'calendarEventId',
  targetFields: [
    {
      name: 'targetPerson',
      relation: { targetObjectMetadata: { id: PERSON_OBJECT_METADATA_ID } },
    },
  ],
};

const TARGETS = [
  {
    objectMetadataId: PERSON_OBJECT_METADATA_ID,
    recordId: PERSON_ID,
    record: { id: PERSON_ID },
  },
];

describe('useCreateCalendarEventTargets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseObjectMorphJunctionConfig.mockReturnValue(JUNCTION_CONFIG);
  });

  it('upserts the junction rows so they survive participant matching', async () => {
    const { result } = renderHook(() => useCreateCalendarEventTargets());

    await result.current.createCalendarEventTargets({
      calendarEventId: CALENDAR_EVENT_ID,
      targets: TARGETS as never,
    });

    expect(mockCreateManyRecords).toHaveBeenCalledWith({
      recordsToCreate: [
        {
          calendarEventId: CALENDAR_EVENT_ID,
          targetPersonId: PERSON_ID,
        },
      ],
      upsert: true,
    });
  });

  it('writes nothing when the object has no junction', async () => {
    mockUseObjectMorphJunctionConfig.mockReturnValue(null);

    const { result } = renderHook(() => useCreateCalendarEventTargets());

    await result.current.createCalendarEventTargets({
      calendarEventId: CALENDAR_EVENT_ID,
      targets: TARGETS as never,
    });

    expect(mockCreateManyRecords).not.toHaveBeenCalled();
  });
});
