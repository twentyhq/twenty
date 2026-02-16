import { type ValidationResult } from '@/sdk/api/types/define-entity.type';

export const createValidationResult = <T>({
  config,
  errors = [],
}: {
  config: T;
  errors: string[];
}): ValidationResult<T> => ({
  success: errors.length === 0,
  config,
  errors,
});
