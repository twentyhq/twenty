import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type FlatApplicationCacheMaps = {
  byId: Partial<Record<string, FlatApplication>>;
  idByUniversalIdentifier: Partial<Record<string, string>>;
};
