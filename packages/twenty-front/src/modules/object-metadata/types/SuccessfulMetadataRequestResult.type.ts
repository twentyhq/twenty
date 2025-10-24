export type SuccessfulMetadataRequestResult<T> = {
  status: 'successful';
  data: T;
};
