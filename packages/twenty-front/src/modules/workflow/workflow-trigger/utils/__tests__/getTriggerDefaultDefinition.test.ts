import { DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getTriggerDefaultDefinition } from '../getTriggerDefaultDefinition';

describe('getTriggerDefaultDefinition', () => {
  it('throws if the activeObjectMetadataItems list is empty', () => {
    expect(() => {
      getTriggerDefaultDefinition({
        defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_CREATED,
        type: 'DATABASE_EVENT',
        activeObjectMetadataItems: [],
      });
    }).toThrow();
  });

  it('returns a valid configuration for DATABASE_EVENT trigger type creation', () => {
    expect(
      getTriggerDefaultDefinition({
        defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_CREATED,
        type: 'DATABASE_EVENT',
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: 'DATABASE_EVENT',
      name: 'Record is Created',
      settings: {
        eventName: `${generatedMockObjectMetadataItems[0].nameSingular}.created`,
        outputSchema: {},
      },
    });
  });

  it('returns a valid configuration for DATABASE_EVENT trigger type update', () => {
    expect(
      getTriggerDefaultDefinition({
        defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_UPDATED,
        type: 'DATABASE_EVENT',
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: 'DATABASE_EVENT',
      name: 'Record is Updated',
      settings: {
        eventName: `${generatedMockObjectMetadataItems[0].nameSingular}.updated`,
        outputSchema: {},
      },
    });
  });

  it('returns a valid configuration for DATABASE_EVENT trigger type deletion', () => {
    expect(
      getTriggerDefaultDefinition({
        defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_DELETED,
        type: 'DATABASE_EVENT',
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: 'DATABASE_EVENT',
      name: 'Record is Deleted',
      settings: {
        eventName: `${generatedMockObjectMetadataItems[0].nameSingular}.deleted`,
        outputSchema: {},
      },
    });
  });

  it('returns a valid configuration for DATABASE_EVENT trigger type creation', () => {
    expect(
      getTriggerDefaultDefinition({
        defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_CREATED,
        type: 'DATABASE_EVENT',
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: 'DATABASE_EVENT',
      name: 'Record is Created',
      settings: {
        eventName: `${generatedMockObjectMetadataItems[0].nameSingular}.created`,
        outputSchema: {},
      },
    });
  });

  it('returns a valid configuration for MANUAL trigger type', () => {
    expect(
      getTriggerDefaultDefinition({
        defaultLabel: 'Launch manually',
        type: 'MANUAL',
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: 'MANUAL',
      name: 'Launch manually',
      settings: {
        objectType: generatedMockObjectMetadataItems[0].nameSingular,
        outputSchema: {},
      },
    });
  });

  it('throws when providing an unknown trigger type', () => {
    expect(() => {
      getTriggerDefaultDefinition({
        defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_CREATED,
        type: 'unknown' as any,
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      });
    }).toThrow('Unknown type: unknown');
  });
});
