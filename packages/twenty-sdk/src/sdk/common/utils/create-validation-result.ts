import { type ValidationResult } from '@/sdk/common/types/define-entity.type';

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
