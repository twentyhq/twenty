import type { RemoteRootElement } from '@remote-dom/core/elements';

const rootTagName = 'remote-root';

export const createRemoteRoot = async (): Promise<RemoteRootElement> => {
  const { RemoteRootElement } = await import('@remote-dom/core/elements');

  if (!customElements.get(rootTagName)) {
    customElements.define(rootTagName, RemoteRootElement);
  }

  const root = document.createElement(rootTagName) as RemoteRootElement;
  document.body.append(root);

  return root;
};
