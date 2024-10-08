export const sortByProperty =
  <T, K extends keyof T>(propertyName: K, sortBy: 'asc' | 'desc' = 'asc') =>
  (objectA: T, objectB: T) => {
    const a = sortBy === 'asc' ? objectA : objectB;
    const b = sortBy === 'asc' ? objectB : objectA;

    if (typeof a[propertyName] === 'string') {
      return (a[propertyName] as string).localeCompare(
        b[propertyName] as string,
      );
    } else if (typeof a[propertyName] === 'number') {
      return (a[propertyName] as number) - (b[propertyName] as number);
    } else {
      return 0;
    }
  };
