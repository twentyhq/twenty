import { type AiChatOpenForm } from 'twenty-shared/ai';

export type AiChatOpenFormRegistration = AiChatOpenForm & {
  onFill: (values: Record<string, string>) => void;
};
