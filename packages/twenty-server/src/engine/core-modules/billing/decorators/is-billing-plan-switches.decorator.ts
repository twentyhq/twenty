/* @license Enterprise */

import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { isPlainObject } from 'twenty-shared/utils';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

const BILLING_PLAN_KEYS = Object.values(BillingPlanKey);

const SWITCH_LIST_KEYS = ['upgradePlanKeys', 'downgradePlanKeys'];

const isBillingPlanKey = (value: unknown): value is BillingPlanKey =>
  BILLING_PLAN_KEYS.some((planKey) => planKey === value);

@ValidatorConstraint({ async: false })
export class IsBillingPlanSwitchesValidator implements ValidatorConstraintInterface {
  validate(planSwitches: unknown) {
    if (!isPlainObject(planSwitches)) {
      return false;
    }

    return Object.entries(planSwitches).every(
      ([planKey, planSwitch]) =>
        isBillingPlanKey(planKey) &&
        isPlainObject(planSwitch) &&
        Object.entries(planSwitch).every(
          ([listKey, targetPlanKeys]) =>
            SWITCH_LIST_KEYS.includes(listKey) &&
            Array.isArray(targetPlanKeys) &&
            targetPlanKeys.every(isBillingPlanKey),
        ),
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must map billing plan keys to { upgradePlanKeys?, downgradePlanKeys? } lists of billing plan keys`;
  }
}

export const IsBillingPlanSwitches =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBillingPlanSwitchesValidator,
    });
  };
