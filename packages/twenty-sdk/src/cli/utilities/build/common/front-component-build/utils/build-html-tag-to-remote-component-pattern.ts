import { HTML_TAG_TO_REMOTE_COMPONENT } from 'twenty-shared/front-component-constants';

export const buildHtmlTagToRemoteComponentPattern = (): RegExp => {
  const supportedHtmlTagNames = Object.keys(HTML_TAG_TO_REMOTE_COMPONENT).join(
    '|',
  );

  return new RegExp(
    `(<\\/?)\\b(${supportedHtmlTagNames})\\b(?=[\\s>\\/>])`,
    'g',
  );
};
