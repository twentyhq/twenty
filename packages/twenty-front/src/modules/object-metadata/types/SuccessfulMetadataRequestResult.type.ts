export type SuccessfulMetadataRequestResult<T> = {
  status: 'successful';
  response: T;
};
