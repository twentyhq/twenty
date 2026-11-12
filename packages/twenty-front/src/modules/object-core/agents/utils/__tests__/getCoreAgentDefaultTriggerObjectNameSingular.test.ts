import { getCoreAgentDefaultTriggerObjectNameSingular } from '@/object-core/agents/utils/getCoreAgentDefaultTriggerObjectNameSingular';

const buildDatabaseEventTrigger = (eventName: string) => ({
  id: '0d2b1a8c-77a4-4e2e-8f0c-3a8e9f6b4c22',
  type: 'DATABASE_EVENT' as const,
  isActive: true,
  instructions: null,
  settings: { eventName },
});

describe('getCoreAgentDefaultTriggerObjectNameSingular', () => {
  it('reuses the object of an existing database event trigger', () => {
    expect(
      getCoreAgentDefaultTriggerObjectNameSingular({
        triggers: [buildDatabaseEventTrigger('company.created')],
        objectNameSingulars: ['person', 'company'],
      }),
    ).toBe('company');
  });

  it('skips an existing trigger object that is not among the options', () => {
    expect(
      getCoreAgentDefaultTriggerObjectNameSingular({
        triggers: [
          buildDatabaseEventTrigger('deletedObject.created'),
          buildDatabaseEventTrigger('company.updated'),
        ],
        objectNameSingulars: ['person', 'company'],
      }),
    ).toBe('company');
    expect(
      getCoreAgentDefaultTriggerObjectNameSingular({
        triggers: [buildDatabaseEventTrigger('deletedObject.created')],
        objectNameSingulars: ['opportunity', 'person'],
      }),
    ).toBe('person');
  });
});
