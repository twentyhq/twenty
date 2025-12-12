import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';

export const extractColorFromProps = (
  props: Record<string, unknown>,
  colorType: 'text' | 'background',
): BlockNoteColor => {
  const propertyName = colorType === 'text' ? 'textColor' : 'backgroundColor';
  return typeof props[propertyName] === 'string'
    ? (props[propertyName] as BlockNoteColor)
    : 'default';
};
