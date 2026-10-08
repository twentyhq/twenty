import { msg } from '@lingui/core/macro';

import { type EmailThemeField } from '@/side-panel/pages/email-block-settings/types/EmailThemeField';

export const EMAIL_PAGE_THEME_FIELDS: EmailThemeField[] = [
  { label: msg`Background`, property: 'pageBackground', input: 'color' },
  {
    label: msg`Padding`,
    property: 'pagePadding',
    input: 'box',
    placeholder: '24',
  },
];
