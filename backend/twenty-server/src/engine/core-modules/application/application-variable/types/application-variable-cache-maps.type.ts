import { type FlatApplicationVariable } from 'src/engine/core-modules/application/application-variable/types/flat-application-variable.type';

export type ApplicationVariableCacheMaps = {
  byId: Partial<Record<string, FlatApplicationVariable>>;
  byApplicationId: Partial<Record<string, FlatApplicationVariable[]>>;
};
