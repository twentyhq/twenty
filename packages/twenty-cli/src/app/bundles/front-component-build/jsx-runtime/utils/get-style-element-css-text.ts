import { type ElementProps } from '@/app/bundles/front-component-build/jsx-runtime/types/element-props.type';
import { extractCssText } from '@/app/bundles/front-component-build/jsx-runtime/utils/extract-css-text';

export const getStyleElementCssText = (
  props: ElementProps | null | undefined,
) =>
  props && props.dangerouslySetInnerHTML
    ? props.dangerouslySetInnerHTML.__html || ''
    : extractCssText(props && props.children);
