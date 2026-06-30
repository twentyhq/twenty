export const setNestedValue = (obj: any, path: string[], value: any) => {
  const newObj = structuredClone(obj);
  path.reduce((o, key, index) => {
    if (index === path.length - 1) {
      o[key] = value;
    }
    return o[key] || {};
  }, newObj);
  return newObj;
};
