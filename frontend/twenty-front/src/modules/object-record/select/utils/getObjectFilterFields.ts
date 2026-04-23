export const getObjectFilterFields = (objectSingleName: string) => {
  if (['workspaceMember', 'person'].includes(objectSingleName)) {
    return ['name.firstName', 'name.lastName'];
  }

  return ['name'];
};
