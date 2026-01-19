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

export class ManifestValidationError extends Error {
  constructor(public readonly errors: ValidationError[]) {
    const messages = errors
      .map((e) => `  • ${e.path}: ${e.message}`)
      .join('\n');
    super(`Manifest validation failed:\n${messages}`);
    this.name = 'ManifestValidationError';
  }
}
