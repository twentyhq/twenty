import { createFrontComponentSandboxIframe } from '../createFrontComponentSandboxIframe';

const SANDBOX_DOCUMENT_URL =
  'https://example.test/front-component-sandbox.html';

const toSandboxTokenSet = (iframe: HTMLIFrameElement): Set<string> =>
  new Set((iframe.getAttribute('sandbox') ?? '').split(/\s+/).filter(Boolean));

describe('createFrontComponentSandboxIframe', () => {
  it('should sandbox the host iframe with only allow-scripts', () => {
    const iframe = createFrontComponentSandboxIframe(SANDBOX_DOCUMENT_URL);
    const tokens = toSandboxTokenSet(iframe);

    expect(tokens.has('allow-scripts')).toBe(true);
    expect(tokens.size).toBe(1);
  });

  it('should never grant allow-same-origin so the worker keeps an opaque origin', () => {
    const iframe = createFrontComponentSandboxIframe(SANDBOX_DOCUMENT_URL);
    const tokens = toSandboxTokenSet(iframe);

    expect(tokens.has('allow-same-origin')).toBe(false);
  });

  it('should keep the sandbox host frame hidden and non-interactive', () => {
    const iframe = createFrontComponentSandboxIframe(SANDBOX_DOCUMENT_URL);

    expect(iframe.getAttribute('aria-hidden')).toBe('true');
    expect(iframe.style.display).toBe('none');
  });

  it('should point the iframe at the provided sandbox document url', () => {
    const iframe = createFrontComponentSandboxIframe(SANDBOX_DOCUMENT_URL);

    expect(iframe.getAttribute('src')).toBe(SANDBOX_DOCUMENT_URL);
  });
});
