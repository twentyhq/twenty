import { type MessageDescriptor } from '@lingui/core';

export type BuiltInApp = {
  id: string;
  name: MessageDescriptor;
  description: MessageDescriptor;
  logo: string;
  coverImage?: string;
};
