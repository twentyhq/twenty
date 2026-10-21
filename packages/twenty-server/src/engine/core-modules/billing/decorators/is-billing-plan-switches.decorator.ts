/* @license Enterprise */

import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlanSwitches } from 'src/engine/core-modules/billing/types/billing-plan-switches.type';
import { findCheckoutDefaultPlanKey } from 'src/engine/core-modules/billing/utils/find-checkout-default-plan-key.util';
import { getSellablePlanKeys } from 'src/engine/core-modules/billing/utils/get-sellable-plan-keys.util';

const BILLING_PLAN_KEYS = Object.values(BillingPlanKey);

const SWITCH_LIST_KEYS = ['upgradePlanKeys', 'downgradePlanKeys'];

const isBillingPlanKey = (value: unknown): value is BillingPlanKey =>
  BILLING_PLAN_KEYS.some((planKey) => planKey === value);

const isBillingPlanSwitchesShape = (
  value: unknown,
): value is BillingPlanSwitches =>
  isPlainObject(value) &&
  Object.entries(value).every(
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

@ValidatorConstraint({ async: false })
export class IsBillingPlanSwitchesValidator implements ValidatorConstraintInterface {
  validate(planSwitches: unknown) {
    return (
      isBillingPlanSwitchesShape(planSwitches) &&
      getSellablePlanKeys(planSwitches).length === 2 &&
      isDefined(findCheckoutDefaultPlanKey(planSwitches))
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must map billing plan keys to { upgradePlanKeys?, downgradePlanKeys? } lists of billing plan keys, with exactly two plans reachable by a switch and one of them without a downgrade`;
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
