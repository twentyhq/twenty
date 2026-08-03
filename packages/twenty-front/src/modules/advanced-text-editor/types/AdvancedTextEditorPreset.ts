import { type AdvancedTextEditorCapability } from '@/advanced-text-editor/types/AdvancedTextEditorCapability';
import { type AdvancedTextEditorContentType } from '@/advanced-text-editor/types/AdvancedTextEditorContentType';

// 'field' keeps the bordered form-field chrome. 'document' drops the border so
// the editor fills whatever container it is given and reads as page content
// rather than as an input. 'canvas' renders the content as a centered
// email page on a muted backdrop, styled by the doc's canvasTheme attribute.
export type AdvancedTextEditorChrome = 'field' | 'document' | 'canvas';

export type AdvancedTextEditorPreset = {
  contentType: AdvancedTextEditorContentType;
  chrome: AdvancedTextEditorChrome;
  minHeight: number;
  enableFullScreen: boolean;
  capabilities: readonly AdvancedTextEditorCapability[];
};
