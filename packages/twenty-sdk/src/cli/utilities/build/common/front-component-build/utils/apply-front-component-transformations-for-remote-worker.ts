import * as esbuild from 'esbuild';

import { replaceHtmlTagsWithRemoteComponents } from './replace-html-tags-with-remote-components';
import { replaceReactImportsWithGlobalThisAssignments } from './replace-react-imports-with-global-this-assignments';
import { unwrapDefineFrontComponentToDirectExport } from './unwrap-define-front-component-to-direct-export';

export const applyFrontComponentTransformationsForRemoteWorker = async (
  sourceFilePath: string,
  sourceCode: string,
): Promise<string> => {
  const sourceWithRemoteComponents =
    replaceHtmlTagsWithRemoteComponents(sourceCode);

  const sourceWithUnwrappedFrontComponent =
    unwrapDefineFrontComponentToDirectExport(sourceWithRemoteComponents);

  const esbuildTransformResult = await esbuild.transform(
    sourceWithUnwrappedFrontComponent,
    {
      loader: 'tsx',
      jsx: 'automatic',
      sourcefile: sourceFilePath,
    },
  );

  const sourceWithGlobalThisReactImports =
    replaceReactImportsWithGlobalThisAssignments(esbuildTransformResult.code);

  return `var RemoteComponents = globalThis.RemoteComponents;\n${sourceWithGlobalThisReactImports}`;
};
