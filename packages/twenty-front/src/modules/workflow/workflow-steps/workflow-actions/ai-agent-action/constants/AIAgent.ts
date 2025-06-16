import { SelectOption } from 'twenty-ui/input';

export const ALL_MODELS: SelectOption<string>[] = [
  // OpenAI Models
  { value: 'gpt-4', label: 'GPT-4 (OpenAI)' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)' },
  // Anthropic Models
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Anthropic)' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (Anthropic)' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Anthropic)' },
];
