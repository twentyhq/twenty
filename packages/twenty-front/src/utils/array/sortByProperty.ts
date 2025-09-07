import { i18n } from '@lingui/core';

export const sortByProperty =
  <T, K extends keyof T>(
    propertyName: K,
    sortBy: 'asc' | 'desc' = 'asc',
    locale: string = i18n.locale,
  ) => {
    const collator = new Intl.Collator(locale);

    return (objectA: T, objectB: T) => {
      const a = sortBy === 'asc' ? objectA : objectB;
      const b = sortBy === 'asc' ? objectB : objectA;

      if (typeof a[propertyName] === 'string') {
        return collator.compare(
          a[propertyName] as string,
          b[propertyName] as string,
        );
      } else if (typeof a[propertyName] === 'number') {
        return (a[propertyName] as number) - (b[propertyName] as number);
      } else {
        throw new Error(
          'Property type not supported in sortByProperty, only string and number are supported',
        );
      }
    };
  };
