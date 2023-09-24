import lavenstein from 'js-levenshtein';

import { type Fields } from '@/spreadsheet-import/types';

type AutoMatchAccumulator<T> = {
  distance: number;
  value: T;
};

export const findMatch = <T extends string>(
  header: string,
  fields: Fields<T>,
  autoMapDistance: number,
): T | undefined => {
  const smallestValue = fields.reduce<AutoMatchAccumulator<T>>((acc, field) => {
    const distance = Math.min(
      ...[
        lavenstein(field.key, header),
        ...(field.alternateMatches?.map((alternate) =>
          lavenstein(alternate, header),
        ) || []),
      ],
    );
    return distance < acc.distance || acc.distance === undefined
      ? ({ value: field.key, distance } as AutoMatchAccumulator<T>)
      : acc;
  }, {} as AutoMatchAccumulator<T>);
  return smallestValue.distance <= autoMapDistance
    ? smallestValue.value
    : undefined;
};
