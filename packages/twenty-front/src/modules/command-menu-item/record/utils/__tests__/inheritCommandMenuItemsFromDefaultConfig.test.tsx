import { DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG } from '@/command-menu-item/record/constants/DefaultRecordCommandMenuItemsConfig';
import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { type DefaultRecordCommandKeys } from '@/command-menu-item/record/types/DefaultRecordCommandKeys';
import { IconHeart, IconPlus } from 'twenty-ui/display';
import { inheritCommandMenuItemsFromDefaultConfig } from '@/command-menu-item/record/utils/inheritCommandMenuItemsFromDefaultConfig';

const MockComponent = <div>Mock Component</div>;

describe('inheritCommandMenuItemsFromDefaultConfig', () => {
  it('should return empty object when no action keys are provided', () => {
    const result = inheritCommandMenuItemsFromDefaultConfig({
      config: {},
      commandKeys: [],
      propertiesToOverwrite: {},
    });

    expect(result).toEqual({});
  });

  it('should return only provided config when no default action keys are specified', () => {
    const customConfig: Record<string, CommandMenuItemConfig> = {
      'custom-action': {
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.Object,
        key: 'custom-action',
        label: 'Custom Action',
        position: 100,
        Icon: IconPlus,
        shouldBeRegistered: () => true,
        component: MockComponent,
      },
    };

    const result = inheritCommandMenuItemsFromDefaultConfig({
      config: customConfig,
      commandKeys: [],
      propertiesToOverwrite: {},
    });

    expect(result).toEqual(customConfig);
  });

  it('should inherit actions from default config', () => {
    const commandKeys: DefaultRecordCommandKeys[] = [
      NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
      SingleRecordCommandKeys.ADD_TO_FAVORITES,
    ];

    const result = inheritCommandMenuItemsFromDefaultConfig({
      config: {},
      commandKeys,
      propertiesToOverwrite: {},
    });

    expect(result).toEqual({
      [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]:
        DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[
          NoSelectionRecordCommandKeys.CREATE_NEW_RECORD
        ],
      [SingleRecordCommandKeys.ADD_TO_FAVORITES]:
        DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[
          SingleRecordCommandKeys.ADD_TO_FAVORITES
        ],
    });
  });

  it('should overwrite specific properties of inherited actions', () => {
    const commandKeys: DefaultRecordCommandKeys[] = [
      NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
    ];

    const propertiesToOverwrite = {
      [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]: {
        label: 'Custom Create Label',
        position: 999,
        isPinned: false,
      },
    };

    const result = inheritCommandMenuItemsFromDefaultConfig({
      config: {},
      commandKeys,
      propertiesToOverwrite,
    });

    const expectedCommandMenuItem = {
      ...DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[
        NoSelectionRecordCommandKeys.CREATE_NEW_RECORD
      ],
      label: 'Custom Create Label',
      position: 999,
      isPinned: false,
    };

    expect(result).toEqual({
      [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]: expectedCommandMenuItem,
    });
  });

  it('should overwrite properties for multiple actions', () => {
    const commandKeys: DefaultRecordCommandKeys[] = [
      NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
      SingleRecordCommandKeys.ADD_TO_FAVORITES,
    ];

    const propertiesToOverwrite = {
      [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]: {
        position: 10,
      },
      [SingleRecordCommandKeys.ADD_TO_FAVORITES]: {
        label: 'Custom Favorite Label',
        Icon: IconHeart,
      },
    };

    const result = inheritCommandMenuItemsFromDefaultConfig({
      config: {},
      commandKeys,
      propertiesToOverwrite,
    });

    expect(result[NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]).toEqual({
      ...DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[
        NoSelectionRecordCommandKeys.CREATE_NEW_RECORD
      ],
      position: 10,
    });

    expect(result[SingleRecordCommandKeys.ADD_TO_FAVORITES]).toEqual({
      ...DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[
        SingleRecordCommandKeys.ADD_TO_FAVORITES
      ],
      label: 'Custom Favorite Label',
      Icon: IconHeart,
    });
  });

  it('should only overwrite properties for specified actions', () => {
    const commandKeys: DefaultRecordCommandKeys[] = [
      NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
      SingleRecordCommandKeys.ADD_TO_FAVORITES,
    ];

    const propertiesToOverwrite = {
      [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]: {
        position: 10,
      },
    };

    const result = inheritCommandMenuItemsFromDefaultConfig({
      config: {},
      commandKeys,
      propertiesToOverwrite,
    });

    expect(result[NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]).toEqual({
      ...DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[
        NoSelectionRecordCommandKeys.CREATE_NEW_RECORD
      ],
      position: 10,
    });

    expect(result[SingleRecordCommandKeys.ADD_TO_FAVORITES]).toEqual(
      DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[
        SingleRecordCommandKeys.ADD_TO_FAVORITES
      ],
    );
  });

  it('should merge inherited actions with provided config', () => {
    const customConfig: Record<string, CommandMenuItemConfig> = {
      'custom-action': {
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.Object,
        key: 'custom-action',
        label: 'Custom Action',
        position: 100,
        Icon: IconPlus,
        shouldBeRegistered: () => true,
        component: MockComponent,
      },
    };

    const commandKeys: DefaultRecordCommandKeys[] = [
      NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
    ];

    const result = inheritCommandMenuItemsFromDefaultConfig({
      config: customConfig,
      commandKeys,
      propertiesToOverwrite: {},
    });

    expect(result).toEqual({
      [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]:
        DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[
          NoSelectionRecordCommandKeys.CREATE_NEW_RECORD
        ],
      'custom-action': customConfig['custom-action'],
    });
  });

  it('should prioritize provided config over inherited actions when keys conflict', () => {
    const customConfig: Record<string, CommandMenuItemConfig> = {
      [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]: {
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.Object,
        key: NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
        label: 'Overridden Create Action',
        position: 999,
        Icon: IconHeart,
        shouldBeRegistered: () => false,
        component: MockComponent,
      },
    };

    const commandKeys: DefaultRecordCommandKeys[] = [
      NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
    ];

    const result = inheritCommandMenuItemsFromDefaultConfig({
      config: customConfig,
      commandKeys,
      propertiesToOverwrite: {},
    });

    expect(result[NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]).toEqual(
      customConfig[NoSelectionRecordCommandKeys.CREATE_NEW_RECORD],
    );
    expect(result[NoSelectionRecordCommandKeys.CREATE_NEW_RECORD].label).toBe(
      'Overridden Create Action',
    );
  });

  it('should handle complex scenario with inheritance, overrides, and custom config', () => {
    const customConfig: Record<string, CommandMenuItemConfig> = {
      'custom-action-1': {
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.Object,
        key: 'custom-action-1',
        label: 'Custom Action 1',
        position: 50,
        Icon: IconPlus,
        shouldBeRegistered: () => true,
        component: MockComponent,
      },
      [SingleRecordCommandKeys.ADD_TO_FAVORITES]: {
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        key: SingleRecordCommandKeys.ADD_TO_FAVORITES,
        label: 'Completely Custom Favorites',
        position: 1000,
        Icon: IconHeart,
        shouldBeRegistered: () => false,
        component: MockComponent,
      },
    };

    const commandKeys: DefaultRecordCommandKeys[] = [
      NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
      SingleRecordCommandKeys.ADD_TO_FAVORITES,
      SingleRecordCommandKeys.REMOVE_FROM_FAVORITES,
    ];

    const propertiesToOverwrite = {
      [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]: {
        label: 'Modified Create Label',
        position: 5,
      },
      [SingleRecordCommandKeys.REMOVE_FROM_FAVORITES]: {
        isPinned: false,
      },
    };

    const result = inheritCommandMenuItemsFromDefaultConfig({
      config: customConfig,
      commandKeys,
      propertiesToOverwrite,
    });

    expect(Object.keys(result)).toHaveLength(4);

    expect(result['custom-action-1']).toEqual(customConfig['custom-action-1']);

    expect(result[NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]).toEqual({
      ...DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[
        NoSelectionRecordCommandKeys.CREATE_NEW_RECORD
      ],
      label: 'Modified Create Label',
      position: 5,
    });

    expect(result[SingleRecordCommandKeys.ADD_TO_FAVORITES]).toEqual(
      customConfig[SingleRecordCommandKeys.ADD_TO_FAVORITES],
    );

    expect(result[SingleRecordCommandKeys.REMOVE_FROM_FAVORITES]).toEqual({
      ...DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[
        SingleRecordCommandKeys.REMOVE_FROM_FAVORITES
      ],
      isPinned: false,
    });
  });

  it('should handle empty overrides gracefully', () => {
    const commandKeys: DefaultRecordCommandKeys[] = [
      NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
    ];

    const propertiesToOverwrite = {
      [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]: {},
    };

    const result = inheritCommandMenuItemsFromDefaultConfig({
      config: {},
      commandKeys,
      propertiesToOverwrite,
    });

    expect(result[NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]).toEqual(
      DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[
        NoSelectionRecordCommandKeys.CREATE_NEW_RECORD
      ],
    );
  });
});
