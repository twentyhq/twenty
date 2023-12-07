export const getObjectFilterFields = (objectSingleName: string) => {
  if (objectSingleName === 'company') {
    return ['name'];
  }

  if (['workspaceMember', 'person'].includes(objectSingleName)) {
    return ['name.firstName', 'name.lastName'];
  }

  return ['name'];
};
