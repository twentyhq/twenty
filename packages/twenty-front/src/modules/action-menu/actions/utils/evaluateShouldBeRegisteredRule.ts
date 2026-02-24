import jsonLogic, { type RulesLogic } from 'json-logic-js';

import { type ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { registerShouldBeRegisteredOperators } from '@/action-menu/actions/utils/registerShouldBeRegisteredOperators';

registerShouldBeRegisteredOperators();

export const evaluateShouldBeRegisteredRule = (
  rule: RulesLogic | boolean | null | undefined,
  params: ShouldBeRegisteredFunctionParams,
): boolean => {
  if (rule === null || rule === undefined) {
    return true;
  }

  if (typeof rule === 'boolean') {
    return rule;
  }

  return jsonLogic.apply(rule, params) === true;
};
