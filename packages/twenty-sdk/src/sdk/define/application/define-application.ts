import { isNonEmptyString } from '@sniptt/guards';
import {
  APPLICATION_CATEGORIES,
  isKnownApplicationCategory,
  isRecurringChargePeriod,
  isRecurringChargeUnit,
  isUsageOperationTypeValue,
  MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT,
  RECURRING_CHARGE_PERIODS,
  RECURRING_CHARGE_UNITS,
  USAGE_OPERATION_TYPES,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ApplicationConfig } from '@/sdk/define/application/application-config';
import { normalizeApplicationAssets } from '@/sdk/define/application/utils/normalize-application-assets';
import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';

export const defineApplication: DefineEntity<ApplicationConfig> = (config) => {
  const errors = [];
  const warnings = [];

  if (!config.universalIdentifier) {
    errors.push('Application must have a universalIdentifier');
  }

  if (!config.displayName || config.displayName.length === 0) {
    errors.push('Application must have a non empty display name');
  }

  for (const [variableName, variable] of Object.entries(
    config.applicationVariables ?? {},
  )) {
    const requiresOptions =
      variable.type === FieldMetadataType.SELECT ||
      variable.type === FieldMetadataType.MULTI_SELECT;

    if (requiresOptions && !isNonEmptyArray(variable.options)) {
      errors.push(
        `Application variable "${variableName}" of type ${variable.type} must define non-empty options`,
      );
    }
  }

  const billableOperations = config.billing?.operations ?? {};
  const recurringCharges = config.billing?.recurring ?? {};

  for (const [operationName, billableOperation] of Object.entries(
    billableOperations,
  )) {
    if (!isDefined(billableOperation)) {
      continue;
    }

    if (!isUsageOperationTypeValue(billableOperation.operationType)) {
      errors.push(
        `Billable operation "${operationName}" must map to a known operationType (${USAGE_OPERATION_TYPES.join(
          ', ',
        )})`,
      );
    }

    if (!isNonEmptyString(billableOperation.label)) {
      errors.push(
        `Billable operation "${operationName}" must have a non empty label`,
      );
    }
  }

  for (const [chargeName, recurringCharge] of Object.entries(
    recurringCharges,
  )) {
    if (!isDefined(recurringCharge)) {
      continue;
    }

    if (!isRecurringChargePeriod(recurringCharge.period)) {
      errors.push(
        `Recurring charge "${chargeName}" must have a known period (${RECURRING_CHARGE_PERIODS.join(
          ', ',
        )})`,
      );
    }

    if (
      isDefined(recurringCharge.per) &&
      !isRecurringChargeUnit(recurringCharge.per)
    ) {
      errors.push(
        `Recurring charge "${chargeName}" must be charged per a known unit (${RECURRING_CHARGE_UNITS.join(
          ', ',
        )}) or omit \`per\` for a flat fee`,
      );
    }

    if (
      !Number.isSafeInteger(recurringCharge.amountMicroCredits) ||
      recurringCharge.amountMicroCredits <= 0
    ) {
      errors.push(
        `Recurring charge "${chargeName}" must have a positive integer amountMicroCredits`,
      );
    } else if (
      recurringCharge.amountMicroCredits >
      MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT
    ) {
      errors.push(
        `Recurring charge "${chargeName}" exceeds the maximum amountMicroCredits of ${MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT}. A per-member charge declares the rate per member, not the total.`,
      );
    }

    if (!isNonEmptyString(recurringCharge.label)) {
      errors.push(
        `Recurring charge "${chargeName}" must have a non empty label`,
      );
    }

    // Both land in the same per-application usage breakdown, keyed by name.
    if (Object.prototype.hasOwnProperty.call(billableOperations, chargeName)) {
      errors.push(
        `"${chargeName}" is declared both as a recurring charge and as a billable operation. Give them distinct names.`,
      );
    }
  }

  for (const [variableName, variable] of Object.entries(
    config.serverVariables ?? {},
  )) {
    if (variable.isRequired && variable.isDeprecated) {
      warnings.push(
        `Server variable "${variableName}" is both required and deprecated. \`isDeprecated\` wins: the variable is excluded from the application configuration check.`,
      );
    }
  }

  if (config.defaultRoleUniversalIdentifier) {
    warnings.push(
      '`defaultRoleUniversalIdentifier` on defineApplication() is deprecated. Use defineApplicationRole() in your role file instead.',
    );
  }

  const { category } = config;

  if (isNonEmptyString(category) && !isKnownApplicationCategory(category)) {
    warnings.push(
      `Application category "${category}" is not a known ApplicationCategory (${APPLICATION_CATEGORIES.join(
        ', ',
      )}). Arbitrary category strings are kept for backward compatibility and may be removed. Ask for a new category at https://github.com/twentyhq/twenty.`,
    );
  }

  const assetNormalization = normalizeApplicationAssets(config);

  warnings.push(...assetNormalization.warnings);

  return createValidationResult({
    config: {
      ...config,
      logo: assetNormalization.logo,
      galleryImages: assetNormalization.galleryImages,
    },
    errors,
    warnings,
  });
};
