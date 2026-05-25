import { type ValidationResult } from '@/sdk/define/common/types/define-entity.type';

export const createValidationResult = <T>({
  config,
  errors = [],
  warnings = [],
}: {
  config: T;
  errors: string[];
  warnings?: string[];
}): ValidationResult<T> => ({
  success: errors.length === 0,
  config,
  errors,
  warnings,
});
