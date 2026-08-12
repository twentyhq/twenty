export const formatSlackObjectLabel = (objectNameSingular: string): string => {
  const words = objectNameSingular
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase();

  return `${words.charAt(0).toUpperCase()}${words.slice(1)}`;
};
