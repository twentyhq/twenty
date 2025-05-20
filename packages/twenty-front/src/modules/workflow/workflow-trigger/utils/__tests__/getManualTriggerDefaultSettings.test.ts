import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getManualTriggerDefaultSettings } from '../getManualTriggerDefaultSettings';

it('returns settings for a manual trigger that can be activated from any where', () => {
  expect(
    getManualTriggerDefaultSettings({
      availability: 'EVERYWHERE',
      activeObjectNonSystemMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    objectType: undefined,
    outputSchema: {},
  });
});

it('returns settings for a manual trigger that can be activated from any where', () => {
  expect(
    getManualTriggerDefaultSettings({
      availability: 'WHEN_RECORD_SELECTED',
      activeObjectNonSystemMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    objectType: generatedMockObjectMetadataItems[0].nameSingular,
    outputSchema: {},
  });
});
