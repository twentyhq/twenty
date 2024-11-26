export const applySimpleQuotesToString = <T extends string>(
  value: T,
): `'${T}'` => `'${value}'`;

export const applySimpleQuotesToStringRecursive = (obj: any): any => {
  if (typeof obj === 'string') {
    if (obj === '') {
      return "''";
    }
    if (obj === "''") {
      return "''";
    }

    obj = applySimpleQuotesToString(obj);

    if (obj.startsWith("''") === true) {
      obj = obj.slice(1);
    }
    if (obj.endsWith("''") === true) {
      obj = obj.slice(0, -1);
    }
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(applySimpleQuotesToStringRecursive);
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) === true) {
        newObj[key] = applySimpleQuotesToStringRecursive(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};
