import { MetadataRequestResult, SuccessfulMetadataRequestResult } from '@/object-metadata/hooks/useUpdateOneFieldMetadataItem';

type AssertIsSuccessfulMetadataRequestResult = <T>(
  value: MetadataRequestResult<T>,
) => asserts value is SuccessfulMetadataRequestResult<T>;

export const jestExpectSuccessfulMetadataRequestResult: AssertIsSuccessfulMetadataRequestResult =
  <T>(value: MetadataRequestResult<T>) => {
    expect(value.status).toBe('successful');
  };
