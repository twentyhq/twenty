import { type CanonicalModel } from './canonical-model.type';

export type CanonicalProvider = { models?: CanonicalModel[] } & Record<
  string,
  unknown
>;
