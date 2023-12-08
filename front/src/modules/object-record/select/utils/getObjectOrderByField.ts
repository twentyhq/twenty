export const getObjectOrderByField = (objectSingleName: string): string => {
  if (objectSingleName === 'company') {
    return 'name';
  }

  if (['workspaceMember', 'person'].includes(objectSingleName)) {
    return 'name.firstName';
  }

  return 'createdAt';
};
