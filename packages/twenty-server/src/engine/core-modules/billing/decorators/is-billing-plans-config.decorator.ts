/* @license Enterprise */

import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { isBoolean } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlansConfig } from 'src/engine/core-modules/billing/types/billing-plans-config.type';
import { findDefaultPlanKey } from 'src/engine/core-modules/billing/utils/find-default-plan-key.util';
import { getSellablePlanKeys } from 'src/engine/core-modules/billing/utils/get-sellable-plan-keys.util';

const BILLING_PLAN_KEYS = Object.values(BillingPlanKey);

const SWITCH_LIST_KEYS = ['upgradePlanKeys', 'downgradePlanKeys'];

const isBillingPlanKey = (value: unknown): value is BillingPlanKey =>
  BILLING_PLAN_KEYS.some((planKey) => planKey === value);

const isPlanConfigEntryValid = ([key, value]: [string, unknown]): boolean =>
  key === 'isDefault'
    ? isBoolean(value)
    : SWITCH_LIST_KEYS.includes(key) &&
      Array.isArray(value) &&
      value.every(isBillingPlanKey);

const isBillingPlansConfigShape = (
  value: unknown,
): value is BillingPlansConfig =>
  isPlainObject(value) &&
  Object.entries(value).every(
    ([planKey, planConfig]) =>
      isBillingPlanKey(planKey) &&
      isPlainObject(planConfig) &&
      Object.entries(planConfig).every(isPlanConfigEntryValid),
  );

@ValidatorConstraint({ async: false })
export class IsBillingPlansConfigValidator implements ValidatorConstraintInterface {
  validate(plansConfig: unknown) {
    if (!isBillingPlansConfigShape(plansConfig)) {
      return false;
    }

    const sellablePlanKeys = getSellablePlanKeys(plansConfig);
    const defaultPlanKey = findDefaultPlanKey(plansConfig);

    return (
      sellablePlanKeys.length === 2 &&
      isDefined(defaultPlanKey) &&
      sellablePlanKeys.includes(defaultPlanKey)
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must map billing plan keys to { isDefault?, upgradePlanKeys?, downgradePlanKeys? }, with exactly two plans reachable by a switch and exactly one of them marked isDefault`;
  }
}

export const IsBillingPlansConfig =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBillingPlansConfigValidator,
    });
  };
