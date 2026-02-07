import { isDefined } from 'twenty-shared/utils';

import { HTML_TAG_TO_REMOTE_COMPONENT } from '../../../../../../sdk/front-component-common';

const REMOTE_COMPONENTS_GLOBAL_NAMESPACE = 'RemoteComponents';

const buildHtmlTagToRemoteComponentPattern = (): RegExp => {
  const supportedHtmlTagNames = Object.keys(HTML_TAG_TO_REMOTE_COMPONENT).join(
    '|',
  );

  return new RegExp(
    `(<\\/?)\\b(${supportedHtmlTagNames})\\b(?=[\\s>\\/>])`,
    'g',
  );
};

const HTML_TAG_TO_REMOTE_COMPONENT_PATTERN =
  buildHtmlTagToRemoteComponentPattern();

export const replaceHtmlTagsWithRemoteComponents = (
  sourceCode: string,
): string => {
  return sourceCode.replace(
    HTML_TAG_TO_REMOTE_COMPONENT_PATTERN,
    (fullMatch, tagPrefix: string, htmlTagName: string) => {
      const remoteComponentName =
        HTML_TAG_TO_REMOTE_COMPONENT[
          htmlTagName as keyof typeof HTML_TAG_TO_REMOTE_COMPONENT
        ];

      if (isDefined(remoteComponentName)) {
        return `${tagPrefix}${REMOTE_COMPONENTS_GLOBAL_NAMESPACE}.${remoteComponentName}`;
      }

      return fullMatch;
    },
  );
};
