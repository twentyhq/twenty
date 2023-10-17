export const capitalize = (stringToCapitalize: string) => {
  return (
    stringToCapitalize.slice(0, 1).toLocaleUpperCase() +
    stringToCapitalize.slice(1)
  );
};
