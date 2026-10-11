import { injectedStyleKeys } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/states/injected-style-keys';
import { toStyleKey } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/to-style-key';

export const injectStyleViaHead = (cssText: string) => {
  if (!cssText) {
    return;
  }

  const styleKey = toStyleKey(cssText);
  if (injectedStyleKeys[styleKey]) {
    return;
  }

  injectedStyleKeys[styleKey] = true;
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-jsx-style', styleKey);
  styleElement.textContent = cssText;
  document.head.appendChild(styleElement);
};
