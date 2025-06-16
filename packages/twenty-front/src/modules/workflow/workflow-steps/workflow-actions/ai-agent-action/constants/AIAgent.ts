import { SelectOption } from 'twenty-ui/input';

export const ALL_MODELS: SelectOption<string>[] = [
  { value: 'gpt-4.5', label: 'GPT-4.5 (OpenAI)' },
  { value: 'gpt-4.1', label: 'GPT-4.1 (OpenAI)' },
  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)' },
  { value: 'o3', label: 'O3 (OpenAI)' },
  { value: 'o3-mini', label: 'O3 Mini (OpenAI)' },
  { value: 'o3-pro', label: 'O3 Pro (OpenAI)' },
  { value: 'o4-mini', label: 'O4 Mini (OpenAI)' },
  { value: 'claude-4-opus-20250522', label: 'Claude 4 Opus (Anthropic)' },
  { value: 'claude-4-sonnet-20250522', label: 'Claude 4 Sonnet (Anthropic)' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Anthropic)' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (Anthropic)' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Anthropic)' },
];
