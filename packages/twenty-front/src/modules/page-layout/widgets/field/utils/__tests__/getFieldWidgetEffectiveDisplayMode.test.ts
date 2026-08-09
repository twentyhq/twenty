import { getFieldWidgetEffectiveDisplayMode } from '@/page-layout/widgets/field/utils/getFieldWidgetEffectiveDisplayMode';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

describe('getFieldWidgetEffectiveDisplayMode', () => {
  it('should keep the table display mode when the widget has a view', () => {
    expect(
      getFieldWidgetEffectiveDisplayMode({
        fieldDisplayMode: FieldDisplayMode.TABLE,
        viewId: 'view-id',
      }),
    ).toBe(FieldDisplayMode.TABLE);
  });

  // An embedded view is the only thing the table display mode can render, so
  // without one the widget must fall back rather than render nothing.
  it.each([undefined, ''])(
    'should fall back to the field display mode when the view id is %p',
    (viewId) => {
      expect(
        getFieldWidgetEffectiveDisplayMode({
          fieldDisplayMode: FieldDisplayMode.TABLE,
          viewId,
        }),
      ).toBe(FieldDisplayMode.FIELD);
    },
  );

  it.each([
    FieldDisplayMode.FIELD,
    FieldDisplayMode.CARD,
    FieldDisplayMode.EDITOR,
  ])('should leave the %s display mode untouched', (fieldDisplayMode) => {
    expect(getFieldWidgetEffectiveDisplayMode({ fieldDisplayMode })).toBe(
      fieldDisplayMode,
    );
  });
});
