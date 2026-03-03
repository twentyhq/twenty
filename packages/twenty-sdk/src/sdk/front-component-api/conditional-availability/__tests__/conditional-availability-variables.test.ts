import { ConditionalAvailabilityVariables } from '../conditional-availability-variables';

describe('ConditionalAvailabilityVariables', () => {
  describe('top-level boolean variables', () => {
    it('should produce correct variable paths for boolean flags', () => {
      expect(ConditionalAvailabilityVariables.isShowPage).toBe('isShowPage');
      expect(ConditionalAvailabilityVariables.isInRightDrawer).toBe(
        'isInRightDrawer',
      );
      expect(ConditionalAvailabilityVariables.isFavorite).toBe('isFavorite');
      expect(ConditionalAvailabilityVariables.isRemote).toBe('isRemote');
      expect(ConditionalAvailabilityVariables.isNoteOrTask).toBe(
        'isNoteOrTask',
      );
      expect(ConditionalAvailabilityVariables.isSelectAll).toBe('isSelectAll');
      expect(
        ConditionalAvailabilityVariables.hasAnySoftDeleteFilterOnView,
      ).toBe('hasAnySoftDeleteFilterOnView');
    });
  });

  describe('numeric variables', () => {
    it('should produce correct path for numberOfSelectedRecords', () => {
      expect(ConditionalAvailabilityVariables.numberOfSelectedRecords).toBe(
        'numberOfSelectedRecords',
      );
    });
  });

  describe('nested objectPermissions', () => {
    it('should produce dot-notation paths for permissions', () => {
      expect(
        ConditionalAvailabilityVariables.objectPermissions
          .canReadObjectRecords,
      ).toBe('objectPermissions.canReadObjectRecords');
      expect(
        ConditionalAvailabilityVariables.objectPermissions
          .canUpdateObjectRecords,
      ).toBe('objectPermissions.canUpdateObjectRecords');
      expect(
        ConditionalAvailabilityVariables.objectPermissions
          .canSoftDeleteObjectRecords,
      ).toBe('objectPermissions.canSoftDeleteObjectRecords');
      expect(
        ConditionalAvailabilityVariables.objectPermissions
          .canDestroyObjectRecords,
      ).toBe('objectPermissions.canDestroyObjectRecords');
    });
  });

  describe('nested selectedRecord', () => {
    it('should produce dot-notation paths for record properties', () => {
      expect(ConditionalAvailabilityVariables.selectedRecord.deletedAt).toBe(
        'selectedRecord.deletedAt',
      );
      expect(ConditionalAvailabilityVariables.selectedRecord.isRemote).toBe(
        'selectedRecord.isRemote',
      );
    });
  });

  describe('nested featureFlags', () => {
    it('should produce dot-notation paths for feature flags', () => {
      expect(ConditionalAvailabilityVariables.featureFlags.isAiEnabled).toBe(
        'featureFlags.IS_AI_ENABLED',
      );
      expect(
        ConditionalAvailabilityVariables.featureFlags.isApplicationEnabled,
      ).toBe('featureFlags.IS_APPLICATION_ENABLED');
    });
  });

  describe('dynamic permission functions', () => {
    it('should produce correct paths for target object permissions', () => {
      expect(
        ConditionalAvailabilityVariables.targetObjectReadPermissions('person'),
      ).toBe('targetObjectReadPermissions.person');
      expect(
        ConditionalAvailabilityVariables.targetObjectWritePermissions(
          'company',
        ),
      ).toBe('targetObjectWritePermissions.company');
    });
  });

  describe('template literal usage', () => {
    it('should produce valid expr-eval expressions via template literals', () => {
      const CA = ConditionalAvailabilityVariables;

      const expression = `${CA.objectPermissions.canUpdateObjectRecords} and not ${CA.isInRightDrawer}`;

      expect(expression).toBe(
        'objectPermissions.canUpdateObjectRecords and not isInRightDrawer',
      );
    });
  });
});
