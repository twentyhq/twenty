import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';

type DocumentWithBody = {
  body?: object | null;
};

type InstallDocumentActiveElementPolyfillInput = {
  documentTarget: DocumentWithBody;
  activeElementStore: WorkerActiveElementStore;
};

export const installDocumentActiveElementPolyfill = ({
  documentTarget,
  activeElementStore,
}: InstallDocumentActiveElementPolyfillInput): void => {
  Object.defineProperty(documentTarget, 'activeElement', {
    get: () =>
      activeElementStore.getActiveElement() ?? documentTarget.body ?? null,
    configurable: true,
  });
};
