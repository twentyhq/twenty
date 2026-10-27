import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type RichTextColor } from 'twenty-shared/utils';

export const RICH_TEXT_COLOR_DISPLAY_NAMES: Record<
  RichTextColor,
  MessageDescriptor
> = {
  gray: msg`Gray`,
  brown: msg`Brown`,
  red: msg`Red`,
  orange: msg`Orange`,
  yellow: msg`Yellow`,
  green: msg`Green`,
  blue: msg`Blue`,
  purple: msg`Purple`,
  pink: msg`Pink`,
};
