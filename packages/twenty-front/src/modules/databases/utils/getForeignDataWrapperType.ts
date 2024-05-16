export const getForeignDataWrapperType = (databaseKey: string) => {
  switch (databaseKey) {
    case 'postgresql':
      return 'postgres_fdw';
    case 'stripe':
      return 'stripe_fdw';
    default:
      return null;
  }
};
