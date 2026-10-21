import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';

export type ValidationRuleHelperContext = {
  replaceFromOffset: number;
  items: ValidationRuleHelperItem[];
};
