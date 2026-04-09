import { FieldMetadataType } from 'twenty-shared/types';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

type FieldWidgetFieldTypeConfig = {
  availableDisplayModes: FieldDisplayMode[];
  defaultDisplayMode: FieldDisplayMode;
};

export const FIELD_WIDGET_CONFIG: Partial<
  Record<FieldMetadataType, FieldWidgetFieldTypeConfig>
> = {
  [FieldMetadataType.RELATION]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.CARD],
    defaultDisplayMode: FieldDisplayMode.CARD,
  },
  [FieldMetadataType.MORPH_RELATION]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.CARD],
    defaultDisplayMode: FieldDisplayMode.CARD,
  },
  [FieldMetadataType.RICH_TEXT]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.EDITOR],
    defaultDisplayMode: FieldDisplayMode.EDITOR,
  },
};
