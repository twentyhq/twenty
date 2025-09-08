import { type FlatViewField } from 'src/engine/core-modules/view/types/flat-view-field.type';

export type FlatViewFieldMaps = {
  byId: Partial<Record<string, FlatViewField>>;
  idByUniversalIdentifier: Partial<Record<string, string>>;
};
