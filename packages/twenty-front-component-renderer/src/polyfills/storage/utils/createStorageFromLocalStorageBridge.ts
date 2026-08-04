import { type FrontComponentLocalStorageWorkerBridge } from '@/types/FrontComponentLocalStorageWorkerBridge';

export const createStorageFromLocalStorageBridge = (
  bridge: FrontComponentLocalStorageWorkerBridge,
): Storage => ({
  get length() {
    return bridge.getLength();
  },
  key: (index: number) => bridge.getKeyAtIndex(index),
  getItem: (key: string) => bridge.getItem(String(key)),
  setItem: (key: string, value: string) =>
    bridge.setItem(String(key), String(value)),
  removeItem: (key: string) => bridge.removeItem(String(key)),
  clear: () => bridge.clear(),
});
