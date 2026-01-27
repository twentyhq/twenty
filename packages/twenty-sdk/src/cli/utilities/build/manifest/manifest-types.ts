export type ValidationError = {
  path: string;
  message: string;
};

export type ValidationWarning = {
  path?: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
};
