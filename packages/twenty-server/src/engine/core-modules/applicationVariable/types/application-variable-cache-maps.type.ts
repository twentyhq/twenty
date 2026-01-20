import { type FlatApplicationVariable } from 'src/engine/core-modules/applicationVariable/types/flat-application-variable.type';

export type ApplicationVariableCacheMaps = {
  byId: Partial<Record<string, FlatApplicationVariable>>;
  byApplicationId: Partial<Record<string, FlatApplicationVariable[]>>;
};
