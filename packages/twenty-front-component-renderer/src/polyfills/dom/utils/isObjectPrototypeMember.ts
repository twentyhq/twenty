export const isObjectPrototypeMember = (
  propertyName: string | symbol,
): boolean => propertyName in Object.prototype;
