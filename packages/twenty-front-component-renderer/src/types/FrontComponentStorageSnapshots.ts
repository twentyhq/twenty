import { type FrontComponentStorageArea } from 'twenty-sdk/front-component';

export type FrontComponentStorageSnapshots = Record<
  FrontComponentStorageArea,
  Record<string, string>
>;
