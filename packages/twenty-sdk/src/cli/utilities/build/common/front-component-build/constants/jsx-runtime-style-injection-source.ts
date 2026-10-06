export const JSX_RUNTIME_STYLE_INJECTION_SOURCE = `
const injectedStyleKeys = {};

function toStyleKey(cssText) {
  let cssTextHash = 0;
  for (
    let characterIndex = 0;
    characterIndex < cssText.length;
    characterIndex++
  ) {
    cssTextHash =
      ((cssTextHash << 5) - cssTextHash + cssText.charCodeAt(characterIndex)) |
      0;
  }
  return 'jsx-style-' + cssTextHash;
}

export function injectStyleViaHead(cssText) {
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
}

export function extractCssText(children) {
  if (typeof children === 'string') {
    return children;
  }

  if (!Array.isArray(children)) {
    return '';
  }

  return children.filter((child) => typeof child === 'string').join('');
}
`.trim();
