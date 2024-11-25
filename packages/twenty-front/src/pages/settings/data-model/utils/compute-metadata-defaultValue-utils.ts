export const computeMetadataDefaultValue = (input: any): any => {
  if (typeof input !== 'object') {
    return input;
  }
  return addSingleQuotesToStrings(input);
};

export const addSingleQuotesToStrings = (obj: any): any => {
  if (typeof obj === 'string') {
    if (obj === '') {
      return "''";
    }
    if (obj === "''") {
      return "''";
    }

    obj = "'" + obj + "'";

    if (obj.startsWith("''") === true) {
      obj = obj.slice(1);
    }
    if (obj.endsWith("''") === true) {
      obj = obj.slice(0, -1);
    }
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(addSingleQuotesToStrings);
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) === true) {
        newObj[key] = addSingleQuotesToStrings(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};
export const removeSingleQuotesFromStrings = (obj: any): any => {
  if (typeof obj === 'string') {
    if (obj.startsWith("'") && obj.endsWith("'")) {
      return obj.slice(1, -1);
    }
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(removeSingleQuotesFromStrings);
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) === true) {
        newObj[key] = removeSingleQuotesFromStrings(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};
