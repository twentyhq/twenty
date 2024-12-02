import { simpleQuotesStringSchema } from '~/utils/validation-schemas/simpleQuotesStringSchema';

export const stripSimpleQuotesFromString = <Input extends string>(
  value: Input,
) =>
  (simpleQuotesStringSchema.safeParse(value).success
    ? value.slice(1, -1)
    : value) as Input extends `'${infer Output}'` ? Output : Input;

export const stripSimpleQuotesFromStringRecursive = (obj: any): any => {
  if (typeof obj === 'string') {
    return stripSimpleQuotesFromString(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(stripSimpleQuotesFromStringRecursive);
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) === true) {
        newObj[key] = stripSimpleQuotesFromStringRecursive(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};
