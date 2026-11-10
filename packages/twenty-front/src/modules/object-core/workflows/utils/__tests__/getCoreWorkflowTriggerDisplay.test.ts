import { getCoreWorkflowTriggerDisplay } from '@/object-core/workflows/utils/getCoreWorkflowTriggerDisplay';

describe('getCoreWorkflowTriggerDisplay', () => {
  it('returns undefined without a trigger', () => {
    expect(getCoreWorkflowTriggerDisplay(null)).toBeUndefined();
  });

  it('describes a database event with the object it watches', () => {
    expect(
      getCoreWorkflowTriggerDisplay({
        __typename: 'CoreWorkflowTriggerSummary',
        type: 'DATABASE_EVENT',
        databaseEventName: 'company.created',
      }),
    ).toEqual({
      label: 'Record is created',
      iconName: 'IconPlaylistAdd',
      objectNameSingular: 'company',
    });
  });

  it('describes a schedule trigger', () => {
    expect(
      getCoreWorkflowTriggerDisplay({
        __typename: 'CoreWorkflowTriggerSummary',
        type: 'CRON',
        databaseEventName: null,
      }),
    ).toEqual({ label: 'On a schedule', iconName: 'IconClock' });
  });

  it('returns undefined for a database event without an event name', () => {
    expect(
      getCoreWorkflowTriggerDisplay({
        __typename: 'CoreWorkflowTriggerSummary',
        type: 'DATABASE_EVENT',
        databaseEventName: null,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for an unknown trigger type', () => {
    expect(
      getCoreWorkflowTriggerDisplay({
        __typename: 'CoreWorkflowTriggerSummary',
        type: 'UNKNOWN',
        databaseEventName: null,
      }),
    ).toBeUndefined();
  });
});
