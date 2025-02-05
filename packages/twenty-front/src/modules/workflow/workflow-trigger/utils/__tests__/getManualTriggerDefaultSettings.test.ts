import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getManualTriggerDefaultSettings } from '../getManualTriggerDefaultSettings';
import { WorkflowManualTriggerAvailability } from 'twenty-shared';

it('returns settings for a manual trigger that can be activated from any where', () => {
  expect(
    getManualTriggerDefaultSettings({
      availability: WorkflowManualTriggerAvailability.EVERYWHERE,
      activeObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    objectType: undefined,
    outputSchema: {},
  });
});

it('returns settings for a manual trigger that can be activated from any where', () => {
  expect(
    getManualTriggerDefaultSettings({
      availability: WorkflowManualTriggerAvailability.WHEN_RECORD_SELECTED,
      activeObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    objectType: generatedMockObjectMetadataItems[0].nameSingular,
    outputSchema: {},
  });
});
