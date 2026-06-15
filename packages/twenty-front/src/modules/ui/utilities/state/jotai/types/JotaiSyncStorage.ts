// Jotai's synchronous storage contract (not re-exported from jotai/utils). We
// rely on it staying synchronous (no Promise from getItem) so consumers reading
// the atoms with useAtomValue never suspend. `subscribe` is how atomWithStorage
// reactively syncs an atom when the backing store changes.
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
