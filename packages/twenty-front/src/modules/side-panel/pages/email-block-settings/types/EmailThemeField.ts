import { type MessageDescriptor } from '@lingui/core';
import { type CanvasTheme } from 'twenty-shared/utils';

import { type EmailStyleFieldKind } from '@/side-panel/pages/email-block-settings/components/EmailBlockSettingsFieldInput';

export type EmailThemeField = {
  label: MessageDescriptor;
  property: keyof CanvasTheme;
  input: EmailStyleFieldKind;
  placeholder?: string;
};
