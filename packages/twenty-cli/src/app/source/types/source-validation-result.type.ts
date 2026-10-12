export type SourceValidationResult<TConfig = Record<string, unknown>> = {
  success: boolean;
  config: TConfig;
  errors: string[];
  warnings?: string[];
};
