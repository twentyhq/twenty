import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { MentionSuggestion } from '@/mention/extensions/MentionSuggestion';
import { MentionTag } from '@/mention/extensions/MentionTag';
import { SkillSuggestion } from '@/skill-suggestion/extensions/SkillSuggestion';
import { SkillTag } from '@/skill-suggestion/extensions/SkillTag';

export const AI_CHAT_EDITOR_PROFILE = {
  chrome: 'document',
  minHeight: 0,
  enableFullScreen: false,
  buildExtensions: () => [
    MentionTag,
    MentionSuggestion,
    SkillTag,
    SkillSuggestion,
  ],
} satisfies AdvancedTextEditorProfile;
