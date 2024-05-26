export const applySimpleQuotesToString = <T extends string>(
  value: T,
): `'${T}'` => `'${value}'`;
