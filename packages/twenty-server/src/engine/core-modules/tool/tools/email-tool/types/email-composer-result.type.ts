import { type MessageDescriptor } from '@lingui/core';

import { type ComposedEmail } from './composed-email.type';

export type EmailComposerResult =
  | { success: true; data: ComposedEmail }
  | { success: false; error: MessageDescriptor };
