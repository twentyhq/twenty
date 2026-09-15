import { type FrontComponentStorageType } from 'twenty-sdk/front-component';

export type FrontComponentStorageSnapshots = Record<
  FrontComponentStorageType,
  Record<string, string>
>;
