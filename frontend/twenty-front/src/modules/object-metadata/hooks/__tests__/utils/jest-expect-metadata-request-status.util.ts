import { expect } from '@jest/globals';

import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { type SuccessfulMetadataRequestResult } from '@/object-metadata/types/SuccessfulMetadataRequestResult.type';

type AssertIsSuccessfulMetadataRequestResult = <T>(
  value: MetadataRequestResult<T>,
) => asserts value is SuccessfulMetadataRequestResult<T>;

export const jestExpectSuccessfulMetadataRequestResult: AssertIsSuccessfulMetadataRequestResult =
  (value) => {
    expect(value.status).toBe('successful');
  };
