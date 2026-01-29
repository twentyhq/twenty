import type * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import { HTML_TAG_TO_REMOTE_COMPONENT } from 'twenty-shared/front-component-constants';

const REMOTE_COMPONENTS_PREFIX = 'RemoteComponents';

const buildTagPattern = (): RegExp => {
  const tagNames = Object.keys(HTML_TAG_TO_REMOTE_COMPONENT).join('|');
  return new RegExp(`(<\\/?)\\b(${tagNames})\\b(?=[\\s>\\/>])`, 'g');
};

const TAG_PATTERN = buildTagPattern();

export const transformJsxToRemoteComponents = (source: string): string => {
  return source.replace(TAG_PATTERN, (match, prefix, tagName) => {
    const componentName = HTML_TAG_TO_REMOTE_COMPONENT[tagName];
    if (componentName) {
      return `${prefix}${REMOTE_COMPONENTS_PREFIX}.${componentName}`;
    }
    return match;
  });
};

export const jsxTransformPlugin: esbuild.Plugin = {
  name: 'jsx-transform-remote-components',
  setup: (build) => {
    build.onLoad(
      { filter: /\.front-component\.tsx$/ },
      async (args): Promise<esbuild.OnLoadResult> => {
        const source = await fs.readFile(args.path, 'utf8');
        const transformedSource = transformJsxToRemoteComponents(source);

        return {
          contents: transformedSource,
          loader: 'tsx',
        };
      },
    );
  },
};
