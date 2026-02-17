import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

import { type ComposedEmail } from './composed-email.type';

export type EmailComposerResult =
  | { success: true; data: ComposedEmail }
  | { success: false; output: ToolOutput };
