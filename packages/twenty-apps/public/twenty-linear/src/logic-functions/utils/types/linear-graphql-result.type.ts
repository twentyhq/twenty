export type LinearGraphQLResult<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};
