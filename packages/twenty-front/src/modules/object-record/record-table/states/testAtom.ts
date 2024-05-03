import deepEqual from 'fast-deep-equal';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const testJotaiFamily = atomFamily(
  (_: string) => atom<ObjectRecord | undefined>(undefined),
  deepEqual,
);
