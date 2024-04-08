export const getForeignDataWrapperType = (databaseKey: string) => {
  switch (databaseKey) {
    case 'postgresql':
      return 'postgres_fdw';
    default:
      return null;
  }
};
