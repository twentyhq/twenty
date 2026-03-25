type SuccessfulApiResponse<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};
type FailingApiResponse = {
  success: false;
  error?: unknown;
  message?: string;
};
export type ApiResponse<T = unknown> =
  | SuccessfulApiResponse<T>
  | FailingApiResponse;
