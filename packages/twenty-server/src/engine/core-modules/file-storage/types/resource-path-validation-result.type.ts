type ResourcePathValidationSuccess = {
  isValid: true;
};

type ResourcePathValidationFailure = {
  isValid: false;
  error: string;
};

export type ResourcePathValidationResult =
  | ResourcePathValidationSuccess
  | ResourcePathValidationFailure;
