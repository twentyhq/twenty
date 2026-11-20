export type SdkClientGenerationLambdaPayload = {
  gzippedSchema: string;
};

export type SdkClientGenerationLambdaErrorCode =
  | 'GENERATION_FAILED'
  | 'ARCHIVE_TOO_LARGE';

export type SdkClientGenerationLambdaResult =
  | { success: true; archive: string }
  | { success: false; errorCode: SdkClientGenerationLambdaErrorCode };

export type SdkClientGenerationLambdaFailureCode =
  | SdkClientGenerationLambdaErrorCode
  | 'SCHEMA_TOO_LARGE'
  | 'TIMED_OUT'
  | 'OUT_OF_MEMORY'
  | 'FUNCTION_ERROR'
  | 'EMPTY_RESPONSE'
  | 'INVOKE_FAILED'
  | 'INVALID_RESPONSE';
