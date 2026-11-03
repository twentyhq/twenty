import { FieldMetadataType } from 'twenty-shared/types';
import { buildDeviceConditionalDisplay } from 'twenty-shared/utils';

import { restoreLegacyPageLayoutWidgetConditionalDisplay } from 'src/database/commands/upgrade-version-command/2-56/utils/restore-legacy-page-layout-widget-conditional-display.util';
import { compileLegacyWidgetJsonLogic } from 'src/engine/metadata-modules/flat-conditional-display/utils/compile-legacy-widget-json-logic.util';

const NON_DEVICE_CONDITIONAL_DISPLAY = compileLegacyWidgetJsonLogic({
  jsonLogic: { '==': [{ var: 'selectedRecords.0.stage' }, 'WON'] },
  resolveField: () => ({
    fieldMetadataId: '20202020-1111-4111-8111-000000000002',
    type: FieldMetadataType.SELECT,
  }),
});

describe('restoreLegacyPageLayoutWidgetConditionalDisplay', () => {
  it('should clear the display of a widget gated by its device expression', () => {
    expect(
      restoreLegacyPageLayoutWidgetConditionalDisplay({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        conditionalDisplay: buildDeviceConditionalDisplay('MOBILE'),
      }),
    ).toBeNull();
  });

  it('should restore the device json-logic of a widget set from the dropdown', () => {
    expect(
      restoreLegacyPageLayoutWidgetConditionalDisplay({
        conditionalAvailabilityExpression: null,
        conditionalDisplay: buildDeviceConditionalDisplay('DESKTOP'),
      }),
    ).toEqual({ and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }] });
  });

  it('should keep a non-device display', () => {
    expect(
      restoreLegacyPageLayoutWidgetConditionalDisplay({
        conditionalAvailabilityExpression: null,
        conditionalDisplay: NON_DEVICE_CONDITIONAL_DISPLAY,
      }),
    ).toBe(NON_DEVICE_CONDITIONAL_DISPLAY);
  });
});
