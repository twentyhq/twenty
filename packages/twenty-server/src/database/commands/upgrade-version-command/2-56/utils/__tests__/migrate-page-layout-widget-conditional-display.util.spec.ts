import { FieldMetadataType } from 'twenty-shared/types';
import {
  buildDeviceConditionalDisplay,
  compileConditionalAvailabilityExpression,
} from 'twenty-shared/utils';

import { migratePageLayoutWidgetConditionalDisplay } from 'src/database/commands/upgrade-version-command/2-56/utils/migrate-page-layout-widget-conditional-display.util';
import { compileLegacyWidgetJsonLogic } from 'src/engine/metadata-modules/flat-conditional-display/utils/compile-legacy-widget-json-logic.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

const SELECT_FIELD_ID = '20202020-1111-4111-8111-000000000002';

const resolveField = (fieldName: string) =>
  fieldName === 'selectField'
    ? { fieldMetadataId: SELECT_FIELD_ID, type: FieldMetadataType.SELECT }
    : undefined;

const AVAILABILITY_EXPRESSION =
  'targetObjectReadPermissions.person and numberOfSelectedRecords >= 1';
const SELECT_FIELD_JSON_LOGIC = {
  '==': [{ var: 'selectedRecords.0.selectField' }, 'VALUE_15'],
};
const MOBILE_JSON_LOGIC = { and: [{ '===': [{ var: 'device' }, 'MOBILE'] }] };

const toConditionalDisplay = (conditionalDisplay: Record<string, unknown>) =>
  conditionalDisplay as FlatPageLayoutWidget['conditionalDisplay'];

describe('migratePageLayoutWidgetConditionalDisplay', () => {
  it('should compile the availability expression and convert the json-logic', () => {
    expect(
      migratePageLayoutWidgetConditionalDisplay({
        conditionalAvailabilityExpression: AVAILABILITY_EXPRESSION,
        conditionalAvailability: null,
        conditionalDisplay: toConditionalDisplay(SELECT_FIELD_JSON_LOGIC),
        resolveField,
      }),
    ).toEqual({
      conditionalAvailability: compileConditionalAvailabilityExpression(
        AVAILABILITY_EXPRESSION,
      ),
      conditionalDisplay: compileLegacyWidgetJsonLogic({
        jsonLogic: SELECT_FIELD_JSON_LOGIC,
        resolveField,
      }),
      conditionalDisplayConversion: 'jsonLogic',
    });
  });

  it('should keep an availability tree that already exists', () => {
    const conditionalAvailability = compileConditionalAvailabilityExpression(
      'numberOfSelectedRecords == 1',
    );

    expect(
      migratePageLayoutWidgetConditionalDisplay({
        conditionalAvailabilityExpression: AVAILABILITY_EXPRESSION,
        conditionalAvailability,
        conditionalDisplay: null,
        resolveField,
      }).conditionalAvailability,
    ).toBe(conditionalAvailability);
  });

  it('should move a device expression and its json-logic to a device rule', () => {
    expect(
      migratePageLayoutWidgetConditionalDisplay({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        conditionalAvailability: null,
        conditionalDisplay: toConditionalDisplay(MOBILE_JSON_LOGIC),
        resolveField,
      }),
    ).toEqual({
      conditionalAvailability: null,
      conditionalDisplay: buildDeviceConditionalDisplay('MOBILE'),
      conditionalDisplayConversion: 'deviceExpression',
    });
  });

  it('should keep the conditional display of an already migrated device widget', () => {
    const conditionalDisplay = buildDeviceConditionalDisplay('MOBILE');

    expect(
      migratePageLayoutWidgetConditionalDisplay({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        conditionalAvailability: null,
        conditionalDisplay,
        resolveField,
      }),
    ).toEqual({
      conditionalAvailability: null,
      conditionalDisplay,
      conditionalDisplayConversion: 'none',
    });
  });

  it('should throw when a device expression disagrees with the json-logic', () => {
    expect(() =>
      migratePageLayoutWidgetConditionalDisplay({
        conditionalAvailabilityExpression: 'device == "DESKTOP"',
        conditionalAvailability: null,
        conditionalDisplay: toConditionalDisplay(MOBILE_JSON_LOGIC),
        resolveField,
      }),
    ).toThrow('device expression "device == "DESKTOP"" cannot replace');
  });
});
