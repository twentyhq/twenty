import { type AiChatAssistantProfile } from 'twenty-shared/ai';
import { fastDeepEqual } from 'twenty-shared/utils';
import { SETTINGS_AI_ASSISTANT_PRESETS } from '~/pages/settings/ai/constants/SettingsAiAssistantPresets';

export const getSettingsAiAssistantPreset = (value: AiChatAssistantProfile) =>
  SETTINGS_AI_ASSISTANT_PRESETS.find((preset) => fastDeepEqual(preset, value));
