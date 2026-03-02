import jsonLogic from 'json-logic-js';

import { type ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { type ShouldBeRegisteredRulesLogic } from '@/action-menu/actions/types/ShouldBeRegisteredRulesLogic';
import { registerShouldBeRegisteredOperators } from '@/action-menu/actions/utils/registerShouldBeRegisteredOperators';
import { type Nullable } from 'twenty-shared/types';

registerShouldBeRegisteredOperators();

export const evaluateShouldBeRegisteredRule = (
  rule: Nullable<ShouldBeRegisteredRulesLogic>,
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
