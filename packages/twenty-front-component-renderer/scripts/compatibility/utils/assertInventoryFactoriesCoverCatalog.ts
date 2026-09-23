import { isNonEmptyArray } from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryCatalogSchema } from '../schemas/inventoryCatalogSchema';

export const assertInventoryFactoriesCoverCatalog = ({
  catalog,
  factories,
}: {
  catalog: z.infer<typeof inventoryCatalogSchema>;
  factories: Record<string, () => unknown>;
}) => {
  const factoryNames = new Set(Object.keys(factories));
  const unknownFactoryNames = catalog.targets.flatMap(({ target }) =>
    target.kind === 'factory' && !factoryNames.has(target.name)
      ? [target.name]
      : [],
  );
  if (isNonEmptyArray(unknownFactoryNames)) {
    throw new Error(
      `The inventory fixture has no factory for ${unknownFactoryNames.join(', ')}; rebuild the Storybook fixtures from the current sources`,
    );
  }
};
