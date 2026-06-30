import { type FieldMetadataType } from 'twenty-shared/types';
import { FieldDisplayMode, RelationType } from '~/generated-metadata/graphql';

import { FIELD_WIDGET_CONFIG } from '@/page-layout/widgets/field/constants/fieldWidgetConfig';

export const getFieldWidgetConfig = (fieldType: FieldMetadataType) =>
  FIELD_WIDGET_CONFIG[fieldType];

export const getFieldWidgetDefaultDisplayMode = (
  fieldType: FieldMetadataType,
) =>
  getFieldWidgetConfig(fieldType)?.defaultDisplayMode ?? FieldDisplayMode.FIELD;

export const getFieldWidgetAvailableDisplayModes = (
  fieldType: FieldMetadataType,
  relationType?: RelationType | null,
) => {
  const availableDisplayModes = getFieldWidgetConfig(fieldType)
    ?.availableDisplayModes ?? [FieldDisplayMode.FIELD];

  if (relationType !== RelationType.ONE_TO_MANY) {
    return availableDisplayModes.filter(
      (displayMode) => displayMode !== FieldDisplayMode.TABLE,
    );
  }

  return availableDisplayModes;
};

export const isDisplayModeValidForFieldType = (
  fieldType: FieldMetadataType,
  displayMode: FieldDisplayMode,
  relationType?: RelationType | null,
) =>
  getFieldWidgetAvailableDisplayModes(fieldType, relationType).includes(
    displayMode,
  );
