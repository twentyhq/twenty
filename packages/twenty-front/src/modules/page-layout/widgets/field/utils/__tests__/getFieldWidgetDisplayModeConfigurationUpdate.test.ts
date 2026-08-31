import { getFieldWidgetDisplayModeConfigurationUpdate } from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfigurationUpdate';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

describe('getFieldWidgetDisplayModeConfigurationUpdate', () => {
  it.each([
    FieldDisplayMode.CARD,
    FieldDisplayMode.EDITOR,
    FieldDisplayMode.FIELD,
    FieldDisplayMode.VIEW,
  ])('clears viewer controls for the %s display mode', (fieldDisplayMode) => {
    expect(
      getFieldWidgetDisplayModeConfigurationUpdate(fieldDisplayMode),
    ).toEqual({
      fieldDisplayMode,
      viewerControls: undefined,
    });
  });

  it('preserves viewer controls when switching to the table display mode', () => {
    expect(
      getFieldWidgetDisplayModeConfigurationUpdate(FieldDisplayMode.TABLE),
    ).toEqual({
      fieldDisplayMode: FieldDisplayMode.TABLE,
    });
  });
});
