import {
  rule as explicitBooleanPredicatesInIf,
  RULE_NAME as explicitBooleanPredicatesInIfName,
} from './rules/explicit-boolean-predicates-in-if';

export default {
  meta: { name: 'twenty' },
  rules: {
    [explicitBooleanPredicatesInIfName]: explicitBooleanPredicatesInIf,
  },
};
