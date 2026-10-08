import { CUSTOM_ELEMENT_TAGS } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/constants/custom-element-tags';

export const isCustomElementTag = (type: unknown) =>
  typeof type === 'string' && CUSTOM_ELEMENT_TAGS[type] === true;
