import { ViewFilterOperand } from 'twenty-shared/types';

import { migrateWidgetDeviceVisibility } from 'src/database/commands/upgrade-version-command/2-51/utils/migrate-widget-device-visibility.util';
import { revertWidgetDeviceVisibility } from 'src/database/commands/upgrade-version-command/2-51/utils/revert-widget-device-visibility.util';
import { validateUniversalFlatEntityConditionalDisplays } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-universal-flat-entity-conditional-displays.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '11111111-1111-4111-8111-111111111111';
const OWNER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '22222222-2222-4222-8222-222222222222';

const authorContext = {
  workspaceCustomApplicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  ownerApplicationUniversalIdentifier: OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const MOBILE_CONDITIONAL_DISPLAY = {
  recordFilters: [
    {
      id: '0',
      contextKey: 'device',
      operand: ViewFilterOperand.IS,
      value: '["MOBILE"]',
    },
  ],
};

const DESKTOP_CONDITIONAL_DISPLAY = {
  recordFilters: [
    {
      id: '0',
      contextKey: 'device',
      operand: ViewFilterOperand.IS,
      value: '["DESKTOP"]',
    },
  ],
};

const LEGACY_MOBILE_CONDITIONAL_DISPLAY = {
  and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
};

describe('migrateWidgetDeviceVisibility', () => {
  it('should move device expressions on the widget and its override entries to device rules', () => {
    expect(
      migrateWidgetDeviceVisibility({
        conditionalDisplay: LEGACY_MOBILE_CONDITIONAL_DISPLAY,
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            conditionalAvailabilityExpression: 'device == "DESKTOP"',
            position: { layoutMode: 'VERTICAL_LIST', index: 2 },
          },
        },
        authorContext,
      }),
    ).toEqual({
      conditionalDisplay: MOBILE_CONDITIONAL_DISPLAY,
      conditionalAvailabilityExpression: null,
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          conditionalDisplay: DESKTOP_CONDITIONAL_DISPLAY,
          position: { layoutMode: 'VERTICAL_LIST', index: 2 },
        },
      },
      nulledConditionalDisplays: [],
    });
  });

  it('should turn a null expression override entry into a null rule entry on a device widget', () => {
    const result = migrateWidgetDeviceVisibility({
      conditionalDisplay: LEGACY_MOBILE_CONDITIONAL_DISPLAY,
      conditionalAvailabilityExpression: 'device == "MOBILE"',
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          conditionalAvailabilityExpression: null,
        },
      },
      authorContext,
    });

    expect(result.conditionalDisplay).toEqual(MOBILE_CONDITIONAL_DISPLAY);
    expect(result.overrides).toEqual({
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
        conditionalDisplay: null,
      },
    });
  });

  it('should restore the standard gate a null expression override entry wiped', () => {
    const result = migrateWidgetDeviceVisibility({
      conditionalDisplay: null,
      conditionalAvailabilityExpression: 'featureFlags.IS_SOME_FLAG_ENABLED',
      overrides: { conditionalAvailabilityExpression: null },
      authorContext,
    });

    expect(result.conditionalAvailabilityExpression).toBe(
      'featureFlags.IS_SOME_FLAG_ENABLED',
    );
    expect(result.overrides).toBeNull();
  });

  it('should drop and report any other json-logic rule', () => {
    const foreignConditionalDisplay = {
      or: [{ '===': [{ var: 'pageType' }, 'RECORD_PAGE'] }],
    };

    const result = migrateWidgetDeviceVisibility({
      conditionalDisplay: foreignConditionalDisplay,
      conditionalAvailabilityExpression: null,
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          conditionalDisplay: LEGACY_MOBILE_CONDITIONAL_DISPLAY,
        },
      },
      authorContext,
    });

    expect(result.conditionalDisplay).toBeNull();
    expect(result.overrides).toEqual({
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
        conditionalDisplay: MOBILE_CONDITIONAL_DISPLAY,
      },
    });
    expect(result.nulledConditionalDisplays).toEqual([
      foreignConditionalDisplay,
    ]);
  });

  it('should leave a widget without device visibility as is', () => {
    const overrides = {
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
        conditionalAvailabilityExpression: 'featureFlags.IS_OTHER_FLAG_ENABLED',
      },
    };

    expect(
      migrateWidgetDeviceVisibility({
        conditionalDisplay: DESKTOP_CONDITIONAL_DISPLAY,
        conditionalAvailabilityExpression: 'featureFlags.IS_SOME_FLAG_ENABLED',
        overrides,
        authorContext,
      }),
    ).toEqual({
      conditionalDisplay: DESKTOP_CONDITIONAL_DISPLAY,
      conditionalAvailabilityExpression: 'featureFlags.IS_SOME_FLAG_ENABLED',
      overrides,
      nulledConditionalDisplays: [],
    });
  });
});

describe('revertWidgetDeviceVisibility', () => {
  const revertedWidgetVisibility = revertWidgetDeviceVisibility({
    conditionalDisplay: MOBILE_CONDITIONAL_DISPLAY,
    conditionalAvailabilityExpression: null,
    overrides: {
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
        conditionalDisplay: DESKTOP_CONDITIONAL_DISPLAY,
      },
    },
    authorContext,
  });

  it('should move device rules back to device expressions only', () => {
    expect(revertedWidgetVisibility).toEqual({
      conditionalDisplay: null,
      conditionalAvailabilityExpression: 'device == "MOBILE"',
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          conditionalAvailabilityExpression: 'device == "DESKTOP"',
        },
      },
    });
  });

  it('should produce a widget the conditional display validator accepts', () => {
    expect(
      validateUniversalFlatEntityConditionalDisplays({
        flatEntity: {
          universalConditionalDisplay:
            revertedWidgetVisibility.conditionalDisplay,
          universalOverrides: revertedWidgetVisibility.overrides,
        },
        surface: 'pageLayoutWidget',
        objectMetadataUniversalIdentifier: null,
        invalidDataCode: 'INVALID_PAGE_LAYOUT_WIDGET_DATA',
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
        flatRoleMaps: createEmptyFlatEntityMaps(),
      }),
    ).toEqual([]);
  });

  it('should turn a null rule entry on a device widget back into a null expression entry', () => {
    expect(
      revertWidgetDeviceVisibility({
        conditionalDisplay: MOBILE_CONDITIONAL_DISPLAY,
        conditionalAvailabilityExpression: null,
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            conditionalDisplay: null,
          },
        },
        authorContext,
      }),
    ).toEqual({
      conditionalDisplay: null,
      conditionalAvailabilityExpression: 'device == "MOBILE"',
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          conditionalAvailabilityExpression: null,
        },
      },
    });
  });

  it('should turn a null rule entry over an owner device rule entry back into a null expression entry', () => {
    expect(
      revertWidgetDeviceVisibility({
        conditionalDisplay: null,
        conditionalAvailabilityExpression: null,
        overrides: {
          [OWNER_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            conditionalDisplay: MOBILE_CONDITIONAL_DISPLAY,
          },
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            conditionalDisplay: null,
          },
        },
        authorContext,
      }),
    ).toEqual({
      conditionalDisplay: null,
      conditionalAvailabilityExpression: null,
      overrides: {
        [OWNER_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          conditionalAvailabilityExpression: 'device == "MOBILE"',
        },
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          conditionalAvailabilityExpression: null,
        },
      },
    });
  });
});
