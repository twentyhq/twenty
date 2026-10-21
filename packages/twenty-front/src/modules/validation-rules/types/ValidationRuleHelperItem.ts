import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleSyntaxDefinition } from '@/validation-rules/types/ValidationRuleSyntaxDefinition';

export type ValidationRuleHelperItem =
  | { kind: 'field'; field: ValidationRuleEditorField }
  | { kind: 'function'; definition: ValidationRuleSyntaxDefinition }
  | { kind: 'keyword'; definition: ValidationRuleSyntaxDefinition };
