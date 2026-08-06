import { type MetadataValidationErrorResponse } from 'twenty-shared/metadata';

export type MetadataApiErrorExtensions =
  Partial<MetadataValidationErrorResponse> & {
    userFriendlyMessage?: string;
    subCode?: string;
  };

type SuccessfulApiResponse<TData = unknown> = {
  success: true;
  data: TData;
  message?: string;
};
type FailingApiResponse<TError = unknown> = {
  success: false;
  error?: TError;
  message?: string;
  isAuthError?: boolean;
};
export type ApiResponse<TData = unknown, TError = unknown> =
  | SuccessfulApiResponse<TData>
  | FailingApiResponse<TError>;
