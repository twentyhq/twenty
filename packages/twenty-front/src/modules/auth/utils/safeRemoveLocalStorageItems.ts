export const safeRemoveLocalStorageItems = (keys: string[]) => {
  for (const key of keys) {
    try {
      localStorage.removeItem(key);
    } catch {
      // noop
    }
  }
};
