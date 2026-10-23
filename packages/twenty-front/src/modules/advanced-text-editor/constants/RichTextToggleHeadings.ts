import { type RichTextToggleHeading } from '@/advanced-text-editor/types/RichTextToggleHeading';
import { msg } from '@lingui/core/macro';
import { IconH1, IconH2, IconH3 } from 'twenty-ui/icon';

export const RICH_TEXT_TOGGLE_HEADINGS: RichTextToggleHeading[] = [
  {
    level: 1,
    title: msg`Toggle Heading 1`,
    description: msg`Large heading that hides its content`,
    icon: IconH1,
    keyword: msg`h1`,
  },
  {
    level: 2,
    title: msg`Toggle Heading 2`,
    description: msg`Medium heading that hides its content`,
    icon: IconH2,
    keyword: msg`h2`,
  },
  {
    level: 3,
    title: msg`Toggle Heading 3`,
    description: msg`Small heading that hides its content`,
    icon: IconH3,
    keyword: msg`h3`,
  },
];
