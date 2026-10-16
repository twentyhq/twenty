import { type ElementProps } from '@/front-component-renderer/build/jsx-runtime/types/element-props.type';
import { extractCssText } from '@/front-component-renderer/build/jsx-runtime/utils/extract-css-text';

export const getStyleElementCssText = (
  props: ElementProps | null | undefined,
) =>
  props && props.dangerouslySetInnerHTML
    ? props.dangerouslySetInnerHTML.__html || ''
    : extractCssText(props && props.children);
