import path from 'path';

import * as esbuild from 'esbuild';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';

type ClonedButton = {
  type: string;
  ref?: (element: EventTarget | null) => unknown;
  props: { ref?: (element: EventTarget | null) => unknown };
};

type FrontComponentBundleExports = {
  renderClonedButton: (handlers: {
    onElementClick: () => void;
    onCloneClick: () => void;
  }) => ClonedButton;
};

const FRONT_COMPONENT_SOURCE = `
import { cloneElement } from 'react';
import { jsx } from 'react/jsx-runtime';

export const renderClonedButton = ({ onElementClick, onCloneClick }) =>
  cloneElement(jsx('button', { onClick: onElementClick }), {
    onClick: onCloneClick,
  });
`;

const PACKAGE_ROOT = path.resolve(__dirname, '../../../../../../..');

const buildFrontComponentBundle = async (
  usePreact: boolean,
): Promise<FrontComponentBundleExports> => {
  const { outputFiles } = await esbuild.build({
    stdin: {
      contents: FRONT_COMPONENT_SOURCE,
      resolveDir: PACKAGE_ROOT,
      loader: 'js',
    },
    bundle: true,
    format: 'cjs',
    write: false,
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: getFrontComponentBuildPlugins({ usePreact }),
  });
  const bundleModule = { exports: {} };

  new Function('module', 'exports', outputFiles[0].text)(
    bundleModule,
    bundleModule.exports,
  );

  return bundleModule.exports as FrontComponentBundleExports;
};

describe('jsx runtime remote wrapper plugin', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    {
      runtimeName: 'React',
      usePreact: false,
      getElementRef: (clonedButton: ClonedButton) => clonedButton.props.ref,
    },
    {
      runtimeName: 'Preact',
      usePreact: true,
      getElementRef: (clonedButton: ClonedButton) => clonedButton.ref,
    },
  ])(
    'should run the element handler then the clone handler through one listener in $runtimeName bundles',
    async ({ usePreact, getElementRef }) => {
      vi.stubGlobal('__HTML_TAG_TO_CUSTOM_ELEMENT_TAG__', {
        button: 'html-button',
      });
      const { renderClonedButton } = await buildFrontComponentBundle(usePreact);
      const element = new EventTarget();
      const addEventListener = vi.spyOn(element, 'addEventListener');
      const calls: string[] = [];

      const clonedButton = renderClonedButton({
        onElementClick: () => calls.push('element'),
        onCloneClick: () => calls.push('clone'),
      });
      getElementRef(clonedButton)?.(element);
      element.dispatchEvent(new Event('click'));

      expect(clonedButton.type).toBe('html-button');
      expect(calls).toEqual(['element', 'clone']);
      expect(addEventListener).toHaveBeenCalledTimes(1);
    },
    30000,
  );
});
