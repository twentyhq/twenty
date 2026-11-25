import { type AiChatAssistantProfile } from 'twenty-shared/ai';
import { fastDeepEqual } from 'twenty-shared/utils';

export const getSettingsAiAssistantPreset = ({
  value,
  presets,
}: {
  value: AiChatAssistantProfile;
  presets: readonly AiChatAssistantProfile[];
}) => presets.find((preset) => fastDeepEqual(preset, value));
