export type MediaEnvironmentChangeObserver = {
  observe: () => void;
  disconnect: () => void;
};
