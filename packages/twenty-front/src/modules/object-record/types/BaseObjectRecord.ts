import { type ObjectRecord as SharedObjectRecord } from 'twenty-shared/types';

export type BaseObjectRecord = SharedObjectRecord & {
  __typename: string;
};
