// Some default value are special keywords such as 'uuid' or 'now'
// that are mapped to a function that generates a value on the backend.
// (see serializeFunctionDefaultValue.ts on the server)
// We need to do a similar mapping on the frontend

import { v4 } from 'uuid';

export const getComputedDefaultValue = (defaultValue?: any) => {
  switch (defaultValue) {
    case 'uuid':
      return v4();
    case 'now':
      return new Date().toISOString();
    default:
      return null;
  }
};
