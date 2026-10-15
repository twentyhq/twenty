import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';

export const BLOCKNOTE_COLOR_DISPLAY_NAMES: Record<
  BlockNoteColor,
  MessageDescriptor
> = {
  default: msg`Default`,
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
