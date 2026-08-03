// A capability is a user-facing editing feature a surface opts into, not a
// 1:1 tiptap extension: one capability may load several extensions. Core
// editing (document, paragraph, text, undo...) is not a capability because an
// editor without it is broken rather than configured.
export type AdvancedTextEditorCapability =
  | 'basicMarks'
  | 'headings'
  | 'lists'
  | 'links'
  | 'images'
  | 'variables'
  | 'campaignVariables'
  | 'mentions'
  | 'slashCommand'
  | 'blocks';
