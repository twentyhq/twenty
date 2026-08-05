import { type MessageDescriptor } from '@lingui/core';
import { type CanvasTheme } from 'twenty-shared/utils';

import { type AdvancedTextEditorSettingInput } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';

export type EmailThemeField = {
  label: MessageDescriptor;
  property: keyof CanvasTheme;
  input: AdvancedTextEditorSettingInput;
  placeholder?: string;
};
