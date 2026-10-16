import { TEXT_INPUT_CHANGE_EVENT_TYPE } from '__text_input_change_event_type__';

import { CUSTOM_ELEMENT_TAG_BY_HTML_TAG } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/constants/custom-element-tag-by-html-tag';

export const resolveTextInputChangeEventType = (
  element: EventTarget,
): 'input' | 'change' => {
  if (TEXT_INPUT_CHANGE_EVENT_TYPE === 'change') {
    return 'change';
  }

  const localName = Reflect.get(element, 'localName');

  if (typeof localName !== 'string') {
    return 'change';
  }

  if (
    localName === 'textarea' ||
    localName === CUSTOM_ELEMENT_TAG_BY_HTML_TAG.textarea
  ) {
    return 'input';
  }

  const isInput =
    localName === 'input' ||
    localName === CUSTOM_ELEMENT_TAG_BY_HTML_TAG.input;

  if (!isInput) {
    return 'change';
  }

  const inputType = Reflect.get(element, 'type');
  const normalizedInputType =
    typeof inputType === 'string' ? inputType.toLowerCase() : '';
  const usesNativeChangeEvent =
    normalizedInputType === 'checkbox' ||
    normalizedInputType === 'radio' ||
    normalizedInputType === 'file';

  return usesNativeChangeEvent ? 'change' : 'input';
};
