import sdkJsxRuntimeWrapperSource from '../../../../../../twenty-sdk/src/cli/utilities/build/common/front-component-build/jsx-runtime/jsx-runtime-wrapper.ts?source';
import sdkJsxSharedHelpersSource from '../../../../../../twenty-sdk/src/cli/utilities/build/common/front-component-build/jsx-runtime/jsx-shared-helpers.ts?source';
import sdkReactWrapperSource from '../../../../../../twenty-sdk/src/cli/utilities/build/common/front-component-build/jsx-runtime/react-wrapper.ts?source';
import jsxRuntimeWrapperSource from '@/app/bundles/front-component-build/jsx-runtime/jsx-runtime-wrapper.ts?source';
import jsxSharedHelpersSource from '@/app/bundles/front-component-build/jsx-runtime/jsx-shared-helpers.ts?source';
import reactWrapperSource from '@/app/bundles/front-component-build/jsx-runtime/react-wrapper.ts?source';
import { describe, expect, it } from 'vitest';

describe('front component JSX runtime', () => {
  it.each([
    {
      entryName: 'jsx-runtime-wrapper',
      cliSource: jsxRuntimeWrapperSource,
      sdkSource: sdkJsxRuntimeWrapperSource,
    },
    {
      entryName: 'jsx-shared-helpers',
      cliSource: jsxSharedHelpersSource,
      sdkSource: sdkJsxSharedHelpersSource,
    },
    {
      entryName: 'react-wrapper',
      cliSource: reactWrapperSource,
      sdkSource: sdkReactWrapperSource,
    },
  ])('bundles the same $entryName as the SDK', ({ cliSource, sdkSource }) => {
    expect(cliSource).toBe(sdkSource);
  });
});
