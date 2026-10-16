import { CUSTOM_ELEMENT_TAGS } from '@/app/bundles/front-component-build/jsx-runtime/constants/custom-element-tags';

export const isCustomElementTag = (type: unknown) =>
  typeof type === 'string' && CUSTOM_ELEMENT_TAGS[type] === true;
