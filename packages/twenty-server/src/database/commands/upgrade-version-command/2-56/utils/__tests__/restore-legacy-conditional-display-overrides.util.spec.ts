import { FieldMetadataType } from 'twenty-shared/types';
import { buildDeviceConditionalDisplay } from 'twenty-shared/utils';

import { restoreLegacyConditionalDisplayOverrides } from 'src/database/commands/upgrade-version-command/2-56/utils/restore-legacy-conditional-display-overrides.util';
import { compileLegacyWidgetJsonLogic } from 'src/engine/metadata-modules/flat-conditional-display/utils/compile-legacy-widget-json-logic.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

const APPLICATION_UNIVERSAL_IDENTIFIER = '22222222-2222-4222-8222-222222222222';

const NON_DEVICE_CONDITIONAL_DISPLAY = compileLegacyWidgetJsonLogic({
  jsonLogic: { '==': [{ var: 'selectedRecords.0.stage' }, 'WON'] },
  resolveField: () => ({
    fieldMetadataId: '20202020-1111-4111-8111-000000000002',
    type: FieldMetadataType.SELECT,
  }),
});

const toOverrides = (overrides: Record<string, unknown>) =>
  overrides as FlatPageLayoutWidget['overrides'];

describe('restoreLegacyConditionalDisplayOverrides', () => {
  it('should restore the device json-logic of an override entry', () => {
    expect(
      restoreLegacyConditionalDisplayOverrides(
        toOverrides({
          [APPLICATION_UNIVERSAL_IDENTIFIER]: {
            conditionalDisplay: buildDeviceConditionalDisplay('MOBILE'),
          },
        }),
      ),
    ).toEqual({
      [APPLICATION_UNIVERSAL_IDENTIFIER]: {
        conditionalDisplay: {
          and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
        },
      },
    });
  });

  it('should keep a non-device override entry', () => {
    expect(
      restoreLegacyConditionalDisplayOverrides(
        toOverrides({
          [APPLICATION_UNIVERSAL_IDENTIFIER]: {
            conditionalDisplay: NON_DEVICE_CONDITIONAL_DISPLAY,
          },
        }),
      ),
    ).toEqual({
      [APPLICATION_UNIVERSAL_IDENTIFIER]: {
        conditionalDisplay: NON_DEVICE_CONDITIONAL_DISPLAY,
      },
    });
  });

  it('should keep missing overrides', () => {
    expect(restoreLegacyConditionalDisplayOverrides(null)).toBeNull();
  });
});
