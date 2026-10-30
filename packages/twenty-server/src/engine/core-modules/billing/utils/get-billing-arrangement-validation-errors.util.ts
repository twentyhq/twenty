/* @license Enterprise */

import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { BILLING_ARRANGEMENT_SETTINGS_BY_TYPE } from 'src/engine/core-modules/billing/constants/billing-arrangement-settings-by-type.constant';
import { type BillingArrangementDraft } from 'src/engine/core-modules/billing/types/billing-arrangement-draft.type';
import { type BillingArrangementSettingKey } from 'src/engine/core-modules/billing/types/billing-arrangement-setting-key.type';
import { type BillingArrangementValidationError } from 'src/engine/core-modules/billing/types/billing-arrangement-validation-error.type';

const ALL_SETTING_KEYS = [
  ...new Set(
    Object.values(BILLING_ARRANGEMENT_SETTINGS_BY_TYPE).flatMap(
      ({ required, optional }) => [...required, ...optional],
    ),
  ),
];

const isSettingSet = (
  arrangement: BillingArrangementDraft,
  setting: BillingArrangementSettingKey,
): boolean => {
  const value = arrangement[setting];

  return isString(value) ? isNonEmptyString(value) : isDefined(value);
};

export const getBillingArrangementValidationErrors = (
  arrangement: BillingArrangementDraft,
): BillingArrangementValidationError[] => {
  const errors: BillingArrangementValidationError[] = [];
  const { required, optional } =
    BILLING_ARRANGEMENT_SETTINGS_BY_TYPE[arrangement.type];

  for (const setting of ALL_SETTING_KEYS) {
    const isSet = isSettingSet(arrangement, setting);

    if (required.includes(setting) && !isSet) {
      errors.push({ code: 'MISSING_SETTING', setting });
    }

    if (!required.includes(setting) && !optional.includes(setting) && isSet) {
      errors.push({ code: 'UNEXPECTED_SETTING', setting });
    }
  }

  if (
    isDefined(arrangement.seats) &&
    (!Number.isInteger(arrangement.seats) || arrangement.seats <= 0)
  ) {
    errors.push({ code: 'INVALID_SEATS' });
  }

  if (
    isDefined(arrangement.creditAllowanceMicro) &&
    (!Number.isSafeInteger(arrangement.creditAllowanceMicro) ||
      arrangement.creditAllowanceMicro < 0)
  ) {
    errors.push({ code: 'INVALID_CREDIT_ALLOWANCE' });
  }

  if (
    isDefined(arrangement.endsAt) &&
    arrangement.endsAt <= arrangement.startsAt
  ) {
    errors.push({ code: 'ENDS_BEFORE_START' });
  }

  return errors;
};
