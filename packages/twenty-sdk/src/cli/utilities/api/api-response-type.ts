type SuccessfulApiResponse<TData = unknown> = {
  success: true;
  data: TData;
  message?: string;
};
type FailingApiResponse<TError = unknown> = {
  success: false;
  error?: TError;
  message?: string;
};
export type ApiResponse<TData = unknown, TError = unknown> =
  | SuccessfulApiResponse<TData>
  | FailingApiResponse<TError>;
