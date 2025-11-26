export const getDuplicatedTitle = (title: string): string => {
  return title.endsWith('(Copy)') ? title : `${title} (Copy)`;
};
