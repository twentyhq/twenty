import { EMAIL_DOCUMENT_CAPABILITIES } from '@/advanced-text-editor/constants/EmailDocumentCapabilities';
import { FULL_RICH_TEXT_CAPABILITIES } from '@/advanced-text-editor/constants/FullRichTextCapabilities';
import { type AdvancedTextEditorPreset } from '@/advanced-text-editor/types/AdvancedTextEditorPreset';

// One entry per surface that renders the TipTap editor today. Add a surface
// here rather than passing sizing and content-type props at the call site, so
// the editor's shape per context stays reviewable in one place.
export const ADVANCED_TEXT_EDITOR_PRESETS = {
  // The campaign body owns its whole tab, so it fills the widget instead of
  // sitting in a bordered box. Stored as TipTap JSON so the server can render
  // it to email-safe HTML at send time, like the workflow email node.
  campaignBody: {
    contentType: 'json',
    chrome: 'canvas',
    minHeight: 0,
    enableFullScreen: false,
    capabilities: [...EMAIL_DOCUMENT_CAPABILITIES, 'campaignVariables'],
  },
  inlineEmailBody: {
    contentType: 'html',
    chrome: 'field',
    minHeight: 120,
    enableFullScreen: true,
    capabilities: FULL_RICH_TEXT_CAPABILITIES,
  },
  workflowEmailBody: {
    contentType: 'json',
    chrome: 'field',
    minHeight: 120,
    enableFullScreen: true,
    capabilities: FULL_RICH_TEXT_CAPABILITIES,
  },
  // The RICH_TEXT form input. Its stored value is still BlockNote JSON; only
  // the editing surface is TipTap today.
  recordRichTextField: {
    contentType: 'json',
    chrome: 'field',
    minHeight: 340,
    enableFullScreen: true,
    capabilities: FULL_RICH_TEXT_CAPABILITIES,
  },
  aiInstructions: {
    contentType: 'markdown',
    chrome: 'field',
    minHeight: 120,
    enableFullScreen: true,
    capabilities: FULL_RICH_TEXT_CAPABILITIES,
  },
  aiChat: {
    contentType: 'json',
    chrome: 'document',
    minHeight: 0,
    enableFullScreen: false,
    capabilities: ['mentions'],
  },
} as const satisfies Record<string, AdvancedTextEditorPreset>;

export type AdvancedTextEditorPresetName =
  keyof typeof ADVANCED_TEXT_EDITOR_PRESETS;
