export const getShortNestedFieldLabel = (label: string) => {
  return label.split(' / ').slice(1).join(' / ');
};
