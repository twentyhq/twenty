import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getTriggerDefaultDefinition } from '../getTriggerDefaultDefinition';

it('throws if the activeObjectMetadataItems list is empty', () => {
  expect(() => {
    getTriggerDefaultDefinition({
      type: 'DATABASE_EVENT',
      activeObjectMetadataItems: [],
    });
  }).toThrow();
});

it('returns a valid configuration for DATABASE_EVENT trigger type', () => {
  expect(
    getTriggerDefaultDefinition({
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
      type: 'unknown' as any,
      activeObjectMetadataItems: generatedMockObjectMetadataItems,
    });
  }).toThrow('Unknown type: unknown');
});
