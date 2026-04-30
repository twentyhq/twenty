import { type FieldMetadataType } from 'twenty-shared/types';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

import { FIELD_WIDGET_CONFIG } from '@/page-layout/widgets/field/constants/fieldWidgetConfig';

export const getFieldWidgetConfig = (fieldType: FieldMetadataType) =>
  FIELD_WIDGET_CONFIG[fieldType];

export const getFieldWidgetDefaultDisplayMode = (
  fieldType: FieldMetadataType,
) =>
  getFieldWidgetConfig(fieldType)?.defaultDisplayMode ?? FieldDisplayMode.FIELD;

export const getFieldWidgetAvailableDisplayModes = (
  fieldType: FieldMetadataType,
) =>
  getFieldWidgetConfig(fieldType)?.availableDisplayModes ?? [
    FieldDisplayMode.FIELD,
  ];

export const isDisplayModeValidForFieldType = (
  fieldType: FieldMetadataType,
  displayMode: FieldDisplayMode,
) => getFieldWidgetAvailableDisplayModes(fieldType).includes(displayMode);
