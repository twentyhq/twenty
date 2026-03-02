import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type ReturnToPathSessionStorageEntry = {
  path: string;
  timestamp: number;
};

export const isReturnToPathSessionStorageEntry = (
  value: unknown,
): value is ReturnToPathSessionStorageEntry =>
  isDefined(value) &&
  typeof value === 'object' &&
  isNonEmptyString((value as ReturnToPathSessionStorageEntry).path) &&
  typeof (value as ReturnToPathSessionStorageEntry).timestamp === 'number';
