const FRONT_COMPONENT_SANDBOX_IFRAME_PERMISSIONS = 'allow-scripts';

export const createFrontComponentSandboxIframe = (
  sandboxDocumentUrl: string,
): HTMLIFrameElement => {
  const sandboxIframe = document.createElement('iframe');
  sandboxIframe.setAttribute(
    'sandbox',
    FRONT_COMPONENT_SANDBOX_IFRAME_PERMISSIONS,
  );
  sandboxIframe.setAttribute('aria-hidden', 'true');
  sandboxIframe.style.display = 'none';
  sandboxIframe.src = sandboxDocumentUrl;

  return sandboxIframe;
};
