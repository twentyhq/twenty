import { type MessageDescriptor } from '@lingui/core';
import { type CanvasThemeStringProperty } from 'twenty-shared/utils';

import { type AdvancedTextEditorSettingInput } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';

export type EmailThemeField = {
  label: MessageDescriptor;
  property: CanvasThemeStringProperty;
  input: AdvancedTextEditorSettingInput;
  placeholder?: string;
};
