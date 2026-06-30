import { FieldMetadataType } from 'twenty-shared/types';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

import {
  getFieldWidgetAvailableDisplayModes,
  getFieldWidgetDefaultDisplayMode,
  isDisplayModeValidForFieldType,
} from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfig';

describe('getFieldWidgetDisplayModeConfig', () => {
  it('allows text fields to use field or editor display modes', () => {
    expect(getFieldWidgetAvailableDisplayModes(FieldMetadataType.TEXT)).toEqual(
      [FieldDisplayMode.FIELD, FieldDisplayMode.EDITOR],
    );
  });

  it('keeps field as the default display mode for text fields', () => {
    expect(getFieldWidgetDefaultDisplayMode(FieldMetadataType.TEXT)).toBe(
      FieldDisplayMode.FIELD,
    );
  });

  it('falls back to field mode for field types that do not support editor mode', () => {
    expect(
      isDisplayModeValidForFieldType(
        FieldMetadataType.NUMBER,
        FieldDisplayMode.EDITOR,
      ),
    ).toBe(false);
    expect(getFieldWidgetDefaultDisplayMode(FieldMetadataType.NUMBER)).toBe(
      FieldDisplayMode.FIELD,
    );
  });
});
