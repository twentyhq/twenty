export type JotaiSyncStorage<ValueType> = {
  getItem: (key: string, initialValue: ValueType) => ValueType;
  setItem: (key: string, newValue: ValueType) => void;
  removeItem: (key: string) => void;
  subscribe?: (
    key: string,
    callback: (value: ValueType) => void,
    initialValue: ValueType,
  ) => () => void;
};
