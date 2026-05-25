export type PageLayoutAddTabStrategy = {
  mode: 'direct' | 'dropdown';
  onCreate: () => void;
};
