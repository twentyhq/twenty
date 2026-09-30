import { type MessageDescriptor } from '@lingui/core';

export type ValidationRuleSyntaxDefinition = {
  name: string;
  signature: string;
  description: MessageDescriptor;
};
