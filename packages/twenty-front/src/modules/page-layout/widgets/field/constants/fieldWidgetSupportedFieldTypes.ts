import { type FieldMetadataType } from 'twenty-shared/types';

import { FIELD_WIDGET_CONFIG } from '@/page-layout/widgets/field/constants/fieldWidgetConfig';

export const FIELD_WIDGET_SUPPORTED_FIELD_TYPES = Object.keys(
  FIELD_WIDGET_CONFIG,
) as FieldMetadataType[];
