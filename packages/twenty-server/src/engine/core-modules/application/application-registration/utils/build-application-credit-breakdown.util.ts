import { isNonEmptyString } from '@sniptt/guards';
import {
  type ApplicationBilling,
  isUsageOperationTypeValue,
  USAGE_OPERATION_TYPES,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationRegistrationCreditBreakdownDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-stats.dto';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

type CreditUsageRow = {
  resourceType: string;
  operationType: string;
  resourceContext: string;
  creditsUsedMicro: string;
};

export const buildApplicationCreditBreakdown = ({
  billingDefinitions,
  usageRows,
}: {
  billingDefinitions: (ApplicationBilling | null | undefined)[];
  usageRows: CreditUsageRow[];
}): {
  totalCreditsConsumed: number;
  creditBreakdown: ApplicationRegistrationCreditBreakdownDTO[];
} => {
  const operations = new Map<
    string,
    Omit<ApplicationRegistrationCreditBreakdownDTO, 'creditsConsumed'>
  >();
  const creditsByOperation = new Map<string, number>();
  const getAppOperationKey = (operationType: string, name: string) =>
    `app:${JSON.stringify([operationType, name])}`;

  for (const operationType of USAGE_OPERATION_TYPES) {
    const key = `type:${operationType}`;

    operations.set(key, {
      key,
      label: operationType,
      operationType,
      isAppDefined: false,
    });
  }

  for (const billing of billingDefinitions) {
    if (!isDefined(billing)) {
      continue;
    }

    const definitions = [
      ...Object.entries(billing.operations ?? {}).flatMap(
        ([name, operation]) =>
          isDefined(operation) &&
          isUsageOperationTypeValue(operation.operationType)
            ? [
                {
                  name,
                  operationType: operation.operationType,
                  label: operation.label,
                },
              ]
            : [],
      ),
      ...Object.entries(billing.recurring ?? {}).flatMap(([name, charge]) =>
        isDefined(charge)
          ? [
              {
                name,
                operationType: UsageOperationType.SUBSCRIPTION,
                label: charge.label,
              },
            ]
          : [],
      ),
    ];

    for (const { name, operationType, label } of definitions) {
      const key = getAppOperationKey(operationType, name);

      if (!operations.has(key)) {
        operations.set(key, {
          key,
          label: isNonEmptyString(label) ? label : name,
          operationType,
          isAppDefined: true,
        });
      }
    }
  }

  let totalCreditsMicro = 0;

  for (const row of usageRows) {
    const appOperationKey = getAppOperationKey(
      row.operationType,
      row.resourceContext,
    );
    const key =
      row.resourceType === UsageResourceType.APP &&
      operations.has(appOperationKey)
        ? appOperationKey
        : `type:${row.operationType}`;

    if (!operations.has(key)) {
      operations.set(key, {
        key,
        label: row.operationType,
        operationType: row.operationType,
        isAppDefined: false,
      });
    }

    const creditsMicro = Number(row.creditsUsedMicro);

    creditsByOperation.set(
      key,
      (creditsByOperation.get(key) ?? 0) + creditsMicro,
    );
    totalCreditsMicro += creditsMicro;
  }

  const creditBreakdown = [...creditsByOperation]
    .filter(([, creditsMicro]) => creditsMicro !== 0)
    .map(([key, creditsMicro]) => ({
      ...operations.get(key)!,
      creditsConsumed: toDisplayCredits(creditsMicro),
    }))
    .sort(
      (left, right) =>
        right.creditsConsumed - left.creditsConsumed ||
        left.label.localeCompare(right.label) ||
        left.key.localeCompare(right.key),
    );

  return {
    totalCreditsConsumed: toDisplayCredits(totalCreditsMicro),
    creditBreakdown,
  };
};
