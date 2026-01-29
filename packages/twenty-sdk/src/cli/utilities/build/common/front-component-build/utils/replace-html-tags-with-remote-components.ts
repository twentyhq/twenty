import { HTML_TAG_TO_REMOTE_COMPONENT } from 'twenty-shared/front-component-constants';

import { isDefined } from 'twenty-shared/utils';
import { HTML_TAG_TO_REMOTE_COMPONENT_PATTERN } from '../constants/HtmlTagToRemoteComponentPattern';
import { REMOTE_COMPONENTS_GLOBAL_NAMESPACE } from '../constants/RemoteComponentsGlobalNamespace';

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
