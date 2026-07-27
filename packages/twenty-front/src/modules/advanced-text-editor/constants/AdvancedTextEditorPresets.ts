import { type AdvancedTextEditorPreset } from '@/advanced-text-editor/types/AdvancedTextEditorPreset';

// One entry per surface that renders the TipTap editor today. Add a surface
// here rather than passing sizing and content-type props at the call site, so
// the editor's shape per context stays reviewable in one place.
export const ADVANCED_TEXT_EDITOR_PRESETS = {
  // The campaign body owns its whole tab, so it fills the widget instead of
  // sitting in a bordered box.
  campaignBody: {
    contentType: 'html',
    chrome: 'document',
    minHeight: 0,
    enableFullScreen: false,
  },
  inlineEmailBody: {
    contentType: 'html',
    chrome: 'field',
    minHeight: 120,
    enableFullScreen: true,
  },
  workflowEmailBody: {
    contentType: 'json',
    chrome: 'field',
    minHeight: 340,
    enableFullScreen: true,
  },
  // The RICH_TEXT form input. Its stored value is still BlockNote JSON; only
  // the editing surface is TipTap today.
  recordRichTextField: {
    contentType: 'json',
    chrome: 'field',
    minHeight: 340,
    enableFullScreen: true,
  },
  aiInstructions: {
    contentType: 'markdown',
    chrome: 'field',
    minHeight: 120,
    enableFullScreen: true,
  },
} as const satisfies Record<string, AdvancedTextEditorPreset>;

export type AdvancedTextEditorPresetName =
  keyof typeof ADVANCED_TEXT_EDITOR_PRESETS;
