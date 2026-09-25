import { type FailedMetadataRequestResult } from '@/object-metadata/types/FailedMetadataRequestResult';
import { type SuccessfulMetadataRequestResult } from '@/object-metadata/types/SuccessfulMetadataRequestResult';

export type MetadataRequestResult<T> =
  | FailedMetadataRequestResult
  | SuccessfulMetadataRequestResult<T>;
