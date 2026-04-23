import { type FailedMetadataRequestResult } from '@/object-metadata/types/FailedMetadataRequestResult.type';
import { type SuccessfulMetadataRequestResult } from '@/object-metadata/types/SuccessfulMetadataRequestResult.type';

export type MetadataRequestResult<T> =
  | FailedMetadataRequestResult
  | SuccessfulMetadataRequestResult<T>;
