import { WorkflowManualTriggerAvailability } from '@/workflow/types/Workflow';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getManualTriggerDefaultSettings } from '../getManualTriggerDefaultSettings';

it('returns settings for a manual trigger that can be activated from any where', () => {
  expect(
    getManualTriggerDefaultSettings({
      availability: 'EVERYWHERE',
      activeNonSystemObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    objectType: undefined,
    outputSchema: {},
    icon: COMMAND_MENU_DEFAULT_ICON,
  });
});

it('returns settings for a manual trigger that can be activated from any where', () => {
  expect(
    getManualTriggerDefaultSettings({
      availability: 'WHEN_RECORD_SELECTED',
      activeNonSystemObjectMetadataItems: generatedMockObjectMetadataItems,
      icon: 'IconTest',
    }),
  ).toStrictEqual({
    objectType: generatedMockObjectMetadataItems[0].nameSingular,
    outputSchema: {},
    icon: 'IconTest',
  });
});

it('returns settings for WHEN_RECORD_SELECTED with default icon when no custom icon provided', () => {
  expect(
    getManualTriggerDefaultSettings({
      availability: 'WHEN_RECORD_SELECTED',
      activeNonSystemObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    objectType: generatedMockObjectMetadataItems[0].nameSingular,
    outputSchema: {},
    icon: COMMAND_MENU_DEFAULT_ICON,
  });
});

it('throws error for unsupported availability type', () => {
  const invalidAvailability =
    'INVALID_AVAILABILITY' as WorkflowManualTriggerAvailability;

  expect(() =>
    getManualTriggerDefaultSettings({
      availability: invalidAvailability,
      activeNonSystemObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toThrow("Didn't expect to get here.");
});
