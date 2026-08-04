export type FrontComponentLocalStorageBridge = {
  getItem: (key: string) => string | null;
  getKeys: () => string[];
  setItemAndPersist: (key: string, serializedValue: string) => Promise<void>;
  removeItemAndPersist: (key: string) => Promise<boolean>;
  clearAndPersist: () => Promise<void>;
};
