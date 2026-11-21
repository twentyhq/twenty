export const getRelationWithArgumentsVariableNames = (responseKey: string) => ({
  filter: `${responseKey}Filter`,
  orderBy: `${responseKey}OrderBy`,
  first: `${responseKey}First`,
});
