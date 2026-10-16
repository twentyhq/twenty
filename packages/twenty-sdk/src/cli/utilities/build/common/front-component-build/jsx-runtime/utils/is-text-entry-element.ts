import { CUSTOM_ELEMENT_TAG_BY_HTML_TAG } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/constants/custom-element-tag-by-html-tag';

const INPUT_TYPES_WITHOUT_TEXT_ENTRY: Record<string, boolean> = {
  checkbox: true,
  radio: true,
  file: true,
};

export const isTextEntryElement = (element: EventTarget) => {
  const { tagName, type } = element as { tagName?: unknown; type?: unknown };

  if (typeof tagName !== 'string') {
    return false;
  }

  const lowerCaseTagName = tagName.toLowerCase();

  if (lowerCaseTagName === CUSTOM_ELEMENT_TAG_BY_HTML_TAG.textarea) {
    return true;
  }

  const isInputWithoutTextEntry =
    typeof type === 'string' &&
    INPUT_TYPES_WITHOUT_TEXT_ENTRY[type.toLowerCase()] === true;

  return (
    lowerCaseTagName === CUSTOM_ELEMENT_TAG_BY_HTML_TAG.input &&
    !isInputWithoutTextEntry
  );
};
