import { type FlatView } from 'src/engine/core-modules/view/types/flat-view.type';

export type FlatViewMaps = {
  byId: Partial<Record<string, FlatView>>;
  idByUniversalIdentifier: Partial<Record<string, string>>;
};
