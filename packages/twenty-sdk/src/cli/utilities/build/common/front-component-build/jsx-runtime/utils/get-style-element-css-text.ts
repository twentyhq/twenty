import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { extractCssText } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/extract-css-text';

export const getStyleElementCssText = (
  props: ElementProps | null | undefined,
) =>
  props && props.dangerouslySetInnerHTML
    ? props.dangerouslySetInnerHTML.__html || ''
    : extractCssText(props && props.children);
