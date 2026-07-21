import { createFrontComponentSandboxIframe } from '../createFrontComponentSandboxIframe';

const SANDBOX_DOCUMENT =
  '<!doctype html><html><body><script></script></body></html>';

const toSandboxTokenSet = (iframe: HTMLIFrameElement): Set<string> =>
  new Set((iframe.getAttribute('sandbox') ?? '').split(/\s+/).filter(Boolean));

describe('createFrontComponentSandboxIframe', () => {
  it('should sandbox the host iframe with only allow-scripts', () => {
    const iframe = createFrontComponentSandboxIframe(SANDBOX_DOCUMENT);
    const tokens = toSandboxTokenSet(iframe);

    expect(tokens.has('allow-scripts')).toBe(true);
    expect(tokens.size).toBe(1);
  });

  it('should never grant allow-same-origin so the worker keeps an opaque origin', () => {
    const iframe = createFrontComponentSandboxIframe(SANDBOX_DOCUMENT);
    const tokens = toSandboxTokenSet(iframe);

    expect(tokens.has('allow-same-origin')).toBe(false);
  });

  it('should keep the sandbox host frame hidden and non-interactive', () => {
    const iframe = createFrontComponentSandboxIframe(SANDBOX_DOCUMENT);

    expect(iframe.getAttribute('aria-hidden')).toBe('true');
    expect(iframe.style.display).toBe('none');
  });

  it('should inline the sandbox document through srcdoc rather than a cross-origin url', () => {
    const iframe = createFrontComponentSandboxIframe(SANDBOX_DOCUMENT);

    expect(iframe.srcdoc).toBe(SANDBOX_DOCUMENT);
    expect(iframe.getAttribute('src')).toBeNull();
  });
});
