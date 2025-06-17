export const getCleanName = (name: string) => {
  return name.startsWith('_') ? name.slice(1) : name;
};
