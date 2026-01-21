import type { RemoteRootElement } from '@remote-dom/core/elements';

const ROOT_TAG_NAME = 'remote-root';

export const createRemoteRoot = async (): Promise<RemoteRootElement> => {
  const { RemoteRootElement } = await import('@remote-dom/core/elements');

  if (!customElements.get(ROOT_TAG_NAME)) {
    customElements.define(ROOT_TAG_NAME, RemoteRootElement);
  }

  const root = document.createElement(ROOT_TAG_NAME) as RemoteRootElement;
  document.body.append(root);

  return root;
};
