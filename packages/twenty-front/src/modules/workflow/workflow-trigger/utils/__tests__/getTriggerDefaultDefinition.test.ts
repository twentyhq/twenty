import { DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getTriggerDefaultDefinition } from '../getTriggerDefaultDefinition';
import { WorkflowTriggerType } from 'twenty-shared';

describe('getTriggerDefaultDefinition', () => {
  it('throws if the activeObjectMetadataItems list is empty', () => {
    expect(() => {
      getTriggerDefaultDefinition({
        defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_CREATED,
        type: WorkflowTriggerType.DATABASE_EVENT,
        activeObjectMetadataItems: [],
      });
    }).toThrow();
  });

  it('returns a valid configuration for DATABASE_EVENT trigger type creation', () => {
    expect(
      getTriggerDefaultDefinition({
        defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_CREATED,
        type: WorkflowTriggerType.DATABASE_EVENT,
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: WorkflowTriggerType.DATABASE_EVENT,
      name: '',
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
        type: WorkflowTriggerType.DATABASE_EVENT,
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: WorkflowTriggerType.DATABASE_EVENT,
      name: '',
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
        type: WorkflowTriggerType.DATABASE_EVENT,
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: WorkflowTriggerType.DATABASE_EVENT,
      name: '',
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
        type: WorkflowTriggerType.DATABASE_EVENT,
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: WorkflowTriggerType.DATABASE_EVENT,
      name: '',
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
        type: WorkflowTriggerType.MANUAL,
        activeObjectMetadataItems: generatedMockObjectMetadataItems,
      }),
    ).toStrictEqual({
      type: WorkflowTriggerType.MANUAL,
      name: '',
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
