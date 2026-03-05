// Shim for @typescript-eslint/utils/ts-eslint.
// Type-only re-exports are erased by esbuild, so no circular alias issues.

export type {
  RuleContext,
  RuleFix,
  RuleFixer,
  SourceCode,
} from '@typescript-eslint/utils/ts-eslint';
