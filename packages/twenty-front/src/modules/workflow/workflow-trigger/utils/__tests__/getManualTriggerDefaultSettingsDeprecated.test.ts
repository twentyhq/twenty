import { type WorkflowManualTriggerAvailability } from '@/workflow/types/Workflow';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getManualTriggerDefaultSettingsDeprecated } from '../getManualTriggerDefaultSettingsDeprecated';

it('returns settings for a manual trigger that can be activated from any where', () => {
  expect(
    getManualTriggerDefaultSettingsDeprecated({
      availability: 'EVERYWHERE',
      activeNonSystemObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    objectType: undefined,
    outputSchema: {},
    icon: COMMAND_MENU_DEFAULT_ICON,
    isPinned: false,
  });
});

it('returns settings for a manual trigger that can be activated from any where', () => {
  expect(
    getManualTriggerDefaultSettingsDeprecated({
      availability: 'WHEN_RECORD_SELECTED',
      activeNonSystemObjectMetadataItems: generatedMockObjectMetadataItems,
      icon: 'IconTest',
    }),
  ).toStrictEqual({
    objectType: generatedMockObjectMetadataItems[0].nameSingular,
    outputSchema: {},
    icon: 'IconTest',
    isPinned: false,
  });
});

it('returns settings for WHEN_RECORD_SELECTED with default icon when no custom icon provided', () => {
  expect(
    getManualTriggerDefaultSettingsDeprecated({
      availability: 'WHEN_RECORD_SELECTED',
      activeNonSystemObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    objectType: generatedMockObjectMetadataItems[0].nameSingular,
    outputSchema: {},
    icon: COMMAND_MENU_DEFAULT_ICON,
    isPinned: false,
  });
});

it('throws error for unsupported availability type', () => {
  const invalidAvailability =
    'INVALID_AVAILABILITY' as WorkflowManualTriggerAvailability;

  expect(() =>
    getManualTriggerDefaultSettingsDeprecated({
      availability: invalidAvailability,
      activeNonSystemObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toThrow("Didn't expect to get here.");
});
