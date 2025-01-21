import { DatabaseTriggerName } from '@/workflow/workflow-trigger/constants/DatabaseTriggerName';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getTriggerDefaultDefinition } from '../getTriggerDefaultDefinition';

describe('getTriggerDefaultDefinition', () => {
  it('throws if the activeObjectMetadataItems list is empty', () => {
    expect(() => {
      getTriggerDefaultDefinition({
        name: DatabaseTriggerName.RECORD_IS_CREATED,
        type: 'DATABASE_EVENT',
        activeObjectMetadataItems: [],
      });
    }).toThrow();
  });

  it('returns a valid configuration for DATABASE_EVENT trigger type creation', () => {
    expect(
      getTriggerDefaultDefinition({
        name: DatabaseTriggerName.RECORD_IS_CREATED,
        type: 'DATABASE_EVENT',
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: 'DATABASE_EVENT',
      settings: {
        eventName: `${generatedMockObjectMetadataItems[0].nameSingular}.created`,
        outputSchema: {},
      },
    });
  });

  it('returns a valid configuration for DATABASE_EVENT trigger type update', () => {
    expect(
      getTriggerDefaultDefinition({
        name: DatabaseTriggerName.RECORD_IS_UPDATED,
        type: 'DATABASE_EVENT',
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: 'DATABASE_EVENT',
      settings: {
        eventName: `${generatedMockObjectMetadataItems[0].nameSingular}.updated`,
        outputSchema: {},
      },
    });
  });

  it('returns a valid configuration for DATABASE_EVENT trigger type deletion', () => {
    expect(
      getTriggerDefaultDefinition({
        name: DatabaseTriggerName.RECORD_IS_DELETED,
        type: 'DATABASE_EVENT',
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: 'DATABASE_EVENT',
      settings: {
        eventName: `${generatedMockObjectMetadataItems[0].nameSingular}.deleted`,
        outputSchema: {},
      },
    });
  });

  it('returns a valid configuration for DATABASE_EVENT trigger type creation', () => {
    expect(
      getTriggerDefaultDefinition({
        name: DatabaseTriggerName.RECORD_IS_CREATED,
        type: 'DATABASE_EVENT',
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: 'DATABASE_EVENT',
      settings: {
        eventName: `${generatedMockObjectMetadataItems[0].nameSingular}.created`,
        outputSchema: {},
      },
    });
  });

  it('returns a valid configuration for MANUAL trigger type', () => {
    expect(
      getTriggerDefaultDefinition({
        name: 'Launch manually',
        type: 'MANUAL',
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: 'MANUAL',
      settings: {
        objectType: generatedMockObjectMetadataItems[0].nameSingular,
        outputSchema: {},
      },
    });
  });

  it('throws when providing an unknown trigger type', () => {
    expect(() => {
      getTriggerDefaultDefinition({
        name: DatabaseTriggerName.RECORD_IS_CREATED,
        type: 'unknown' as any,
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      });
    }).toThrow('Unknown type: unknown');
  });
});
