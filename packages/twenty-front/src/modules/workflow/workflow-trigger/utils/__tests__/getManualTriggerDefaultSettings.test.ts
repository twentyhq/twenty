import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { getManualTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettings';

const mockObjectMetadataItems = [{ nameSingular: 'company' }];

describe('getManualTriggerDefaultSettings', () => {
  describe('GLOBAL availability', () => {
    it('should return correct settings for GLOBAL type', () => {
      const result = getManualTriggerDefaultSettings({
        availabilityType: 'GLOBAL',
        activeNonSystemObjectMetadataItems: mockObjectMetadataItems,
      });

      expect(result).toEqual({
        objectType: undefined,
        availability: {
          type: 'GLOBAL',
          locations: undefined,
        },
        outputSchema: {},
        icon: COMMAND_MENU_DEFAULT_ICON,
        isPinned: false,
      });
    });

    it('should use custom icon when provided', () => {
      const result = getManualTriggerDefaultSettings({
        availabilityType: 'GLOBAL',
        activeNonSystemObjectMetadataItems: mockObjectMetadataItems,
        icon: 'IconCustom',
      });

      expect(result.icon).toBe('IconCustom');
    });

    it('should use isPinned when provided', () => {
      const result = getManualTriggerDefaultSettings({
        availabilityType: 'GLOBAL',
        activeNonSystemObjectMetadataItems: mockObjectMetadataItems,
        isPinned: true,
      });

      expect(result.isPinned).toBe(true);
    });
  });

  describe('SINGLE_RECORD availability', () => {
    it('should return correct settings for SINGLE_RECORD type', () => {
      const result = getManualTriggerDefaultSettings({
        availabilityType: 'SINGLE_RECORD',
        activeNonSystemObjectMetadataItems: mockObjectMetadataItems,
      });

      expect(result).toEqual({
        objectType: 'company',
        availability: {
          type: 'SINGLE_RECORD',
          objectNameSingular: 'company',
        },
        outputSchema: {},
        icon: COMMAND_MENU_DEFAULT_ICON,
        isPinned: false,
      });
    });

    it('should use the first object metadata item', () => {
      const multipleObjects = [
        ...mockObjectMetadataItems,
        { nameSingular: 'person' },
      ];

      const result = getManualTriggerDefaultSettings({
        availabilityType: 'SINGLE_RECORD',
        activeNonSystemObjectMetadataItems: multipleObjects,
      });

      expect(result.objectType).toBe('company');
      expect(
        (result.availability as { objectNameSingular: string })
          .objectNameSingular,
      ).toBe('company');
    });
  });

  describe('BULK_RECORDS availability', () => {
    it('should return correct settings for BULK_RECORDS type', () => {
      const result = getManualTriggerDefaultSettings({
        availabilityType: 'BULK_RECORDS',
        activeNonSystemObjectMetadataItems: mockObjectMetadataItems,
      });

      expect(result).toEqual({
        objectType: 'company',
        availability: {
          type: 'BULK_RECORDS',
          objectNameSingular: 'company',
        },
        outputSchema: {},
        icon: COMMAND_MENU_DEFAULT_ICON,
        isPinned: false,
      });
    });
  });
});
