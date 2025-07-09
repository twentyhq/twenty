import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { DefaultRecordActionConfigKeys } from '@/action-menu/actions/types/DefaultRecordActionConfigKeys';
import { IconHeart, IconPlus } from 'twenty-ui/display';
import { inheritActionsFromDefaultConfig } from '../inheritActionsFromDefaultConfig';

const MockComponent = <div>Mock Component</div>;

describe('inheritActionsFromDefaultConfig', () => {
  describe('when given empty parameters', () => {
    it('should return empty object when no action keys are provided', () => {
      const result = inheritActionsFromDefaultConfig({
        config: {},
        actionKeys: [],
        propertiesToOverwrite: {},
      });

      expect(result).toEqual({});
    });

    it('should return only provided config when no default action keys are specified', () => {
      const customConfig: Record<string, ActionConfig> = {
        'custom-action': {
          type: ActionType.Standard,
          scope: ActionScope.Object,
          key: 'custom-action',
          label: 'Custom Action',
          position: 100,
          Icon: IconPlus,
          shouldBeRegistered: () => true,
          component: MockComponent,
        },
      };

      const result = inheritActionsFromDefaultConfig({
        config: customConfig,
        actionKeys: [],
        propertiesToOverwrite: {},
      });

      expect(result).toEqual(customConfig);
    });
  });

  describe('when inheriting from default config', () => {
    it('should inherit single action from default config', () => {
      const actionKeys: DefaultRecordActionConfigKeys[] = [
        NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
      ];

      const result = inheritActionsFromDefaultConfig({
        config: {},
        actionKeys,
        propertiesToOverwrite: {},
      });

      expect(result).toEqual({
        [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]:
          DEFAULT_RECORD_ACTIONS_CONFIG[
            NoSelectionRecordActionKeys.CREATE_NEW_RECORD
          ],
      });
    });

    it('should inherit multiple actions from default config', () => {
      const actionKeys: DefaultRecordActionConfigKeys[] = [
        NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
        SingleRecordActionKeys.ADD_TO_FAVORITES,
      ];

      const result = inheritActionsFromDefaultConfig({
        config: {},
        actionKeys,
        propertiesToOverwrite: {},
      });

      expect(result).toEqual({
        [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]:
          DEFAULT_RECORD_ACTIONS_CONFIG[
            NoSelectionRecordActionKeys.CREATE_NEW_RECORD
          ],
        [SingleRecordActionKeys.ADD_TO_FAVORITES]:
          DEFAULT_RECORD_ACTIONS_CONFIG[
            SingleRecordActionKeys.ADD_TO_FAVORITES
          ],
      });
    });
  });

  describe('when overwriting properties', () => {
    it('should overwrite specific properties of inherited actions', () => {
      const actionKeys: DefaultRecordActionConfigKeys[] = [
        NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
      ];

      const propertiesToOverwrite = {
        [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {
          label: 'Custom Create Label',
          position: 999,
          isPinned: false,
        },
      };

      const result = inheritActionsFromDefaultConfig({
        config: {},
        actionKeys,
        propertiesToOverwrite,
      });

      const expectedAction = {
        ...DEFAULT_RECORD_ACTIONS_CONFIG[
          NoSelectionRecordActionKeys.CREATE_NEW_RECORD
        ],
        label: 'Custom Create Label',
        position: 999,
        isPinned: false,
      };

      expect(result).toEqual({
        [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: expectedAction,
      });
    });

    it('should overwrite properties for multiple actions', () => {
      const actionKeys: DefaultRecordActionConfigKeys[] = [
        NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
        SingleRecordActionKeys.ADD_TO_FAVORITES,
      ];

      const propertiesToOverwrite = {
        [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {
          position: 10,
        },
        [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
          label: 'Custom Favorite Label',
          Icon: IconHeart,
        },
      };

      const result = inheritActionsFromDefaultConfig({
        config: {},
        actionKeys,
        propertiesToOverwrite,
      });

      expect(result[NoSelectionRecordActionKeys.CREATE_NEW_RECORD]).toEqual({
        ...DEFAULT_RECORD_ACTIONS_CONFIG[
          NoSelectionRecordActionKeys.CREATE_NEW_RECORD
        ],
        position: 10,
      });

      expect(result[SingleRecordActionKeys.ADD_TO_FAVORITES]).toEqual({
        ...DEFAULT_RECORD_ACTIONS_CONFIG[
          SingleRecordActionKeys.ADD_TO_FAVORITES
        ],
        label: 'Custom Favorite Label',
        Icon: IconHeart,
      });
    });

    it('should only overwrite properties for specified actions', () => {
      const actionKeys: DefaultRecordActionConfigKeys[] = [
        NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
        SingleRecordActionKeys.ADD_TO_FAVORITES,
      ];

      const propertiesToOverwrite = {
        [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {
          position: 10,
        },
        // No overrides for ADD_TO_FAVORITES
      };

      const result = inheritActionsFromDefaultConfig({
        config: {},
        actionKeys,
        propertiesToOverwrite,
      });

      expect(result[NoSelectionRecordActionKeys.CREATE_NEW_RECORD]).toEqual({
        ...DEFAULT_RECORD_ACTIONS_CONFIG[
          NoSelectionRecordActionKeys.CREATE_NEW_RECORD
        ],
        position: 10,
      });

      expect(result[SingleRecordActionKeys.ADD_TO_FAVORITES]).toEqual(
        DEFAULT_RECORD_ACTIONS_CONFIG[SingleRecordActionKeys.ADD_TO_FAVORITES],
      );
    });
  });

  describe('when merging with existing config', () => {
    it('should merge inherited actions with provided config', () => {
      const customConfig: Record<string, ActionConfig> = {
        'custom-action': {
          type: ActionType.Standard,
          scope: ActionScope.Object,
          key: 'custom-action',
          label: 'Custom Action',
          position: 100,
          Icon: IconPlus,
          shouldBeRegistered: () => true,
          component: MockComponent,
        },
      };

      const actionKeys: DefaultRecordActionConfigKeys[] = [
        NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
      ];

      const result = inheritActionsFromDefaultConfig({
        config: customConfig,
        actionKeys,
        propertiesToOverwrite: {},
      });

      expect(result).toEqual({
        [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]:
          DEFAULT_RECORD_ACTIONS_CONFIG[
            NoSelectionRecordActionKeys.CREATE_NEW_RECORD
          ],
        'custom-action': customConfig['custom-action'],
      });
    });

    it('should prioritize provided config over inherited actions when keys conflict', () => {
      const customConfig: Record<string, ActionConfig> = {
        [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {
          type: ActionType.Standard,
          scope: ActionScope.Object,
          key: NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
          label: 'Overridden Create Action',
          position: 999,
          Icon: IconHeart,
          shouldBeRegistered: () => false,
          component: MockComponent,
        },
      };

      const actionKeys: DefaultRecordActionConfigKeys[] = [
        NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
      ];

      const result = inheritActionsFromDefaultConfig({
        config: customConfig,
        actionKeys,
        propertiesToOverwrite: {},
      });

      // The custom config should take precedence over the default config
      expect(result[NoSelectionRecordActionKeys.CREATE_NEW_RECORD]).toEqual(
        customConfig[NoSelectionRecordActionKeys.CREATE_NEW_RECORD],
      );
      expect(result[NoSelectionRecordActionKeys.CREATE_NEW_RECORD].label).toBe(
        'Overridden Create Action',
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex scenario with inheritance, overrides, and custom config', () => {
      const customConfig: Record<string, ActionConfig> = {
        'custom-action-1': {
          type: ActionType.Standard,
          scope: ActionScope.Object,
          key: 'custom-action-1',
          label: 'Custom Action 1',
          position: 50,
          Icon: IconPlus,
          shouldBeRegistered: () => true,
          component: MockComponent,
        },
        // This should override the inherited action
        [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
          type: ActionType.Standard,
          scope: ActionScope.RecordSelection,
          key: SingleRecordActionKeys.ADD_TO_FAVORITES,
          label: 'Completely Custom Favorites',
          position: 1000,
          Icon: IconHeart,
          shouldBeRegistered: () => false,
          component: MockComponent,
        },
      };

      const actionKeys: DefaultRecordActionConfigKeys[] = [
        NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
        SingleRecordActionKeys.ADD_TO_FAVORITES,
        SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
      ];

      const propertiesToOverwrite = {
        [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {
          label: 'Modified Create Label',
          position: 5,
        },
        [SingleRecordActionKeys.REMOVE_FROM_FAVORITES]: {
          isPinned: false,
        },
      };

      const result = inheritActionsFromDefaultConfig({
        config: customConfig,
        actionKeys,
        propertiesToOverwrite,
      });

      // Should have all expected actions
      expect(Object.keys(result)).toHaveLength(4);

      // Custom action should be preserved
      expect(result['custom-action-1']).toEqual(
        customConfig['custom-action-1'],
      );

      // Create action should be inherited with overrides
      expect(result[NoSelectionRecordActionKeys.CREATE_NEW_RECORD]).toEqual({
        ...DEFAULT_RECORD_ACTIONS_CONFIG[
          NoSelectionRecordActionKeys.CREATE_NEW_RECORD
        ],
        label: 'Modified Create Label',
        position: 5,
      });

      // Add to favorites should be completely overridden by custom config
      expect(result[SingleRecordActionKeys.ADD_TO_FAVORITES]).toEqual(
        customConfig[SingleRecordActionKeys.ADD_TO_FAVORITES],
      );

      // Remove from favorites should be inherited with overrides
      expect(result[SingleRecordActionKeys.REMOVE_FROM_FAVORITES]).toEqual({
        ...DEFAULT_RECORD_ACTIONS_CONFIG[
          SingleRecordActionKeys.REMOVE_FROM_FAVORITES
        ],
        isPinned: false,
      });
    });

    it('should handle empty overrides gracefully', () => {
      const actionKeys: DefaultRecordActionConfigKeys[] = [
        NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
      ];

      const propertiesToOverwrite = {
        [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {},
      };

      const result = inheritActionsFromDefaultConfig({
        config: {},
        actionKeys,
        propertiesToOverwrite,
      });

      expect(result[NoSelectionRecordActionKeys.CREATE_NEW_RECORD]).toEqual(
        DEFAULT_RECORD_ACTIONS_CONFIG[
          NoSelectionRecordActionKeys.CREATE_NEW_RECORD
        ],
      );
    });
  });
});
