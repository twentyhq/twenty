import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';

export type ApplicationVariableCacheMaps = {
  byId: Partial<Record<string, FlatApplicationVariable>>;
  byApplicationId: Partial<Record<string, FlatApplicationVariable[]>>;
};
