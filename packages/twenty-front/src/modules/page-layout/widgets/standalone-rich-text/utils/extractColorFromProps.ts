import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';
import { isString } from '@sniptt/guards';

export const extractColorFromProps = (
  props: Record<string, unknown>,
  colorType: 'text' | 'background',
): BlockNoteColor => {
  const propertyName = colorType === 'text' ? 'textColor' : 'backgroundColor';
  return isString(props[propertyName])
    ? (props[propertyName] as BlockNoteColor)
    : 'default';
};
