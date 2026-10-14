import { isDefined } from 'twenty-shared/utils';

import { USAGE_SPENDER_COLUMN_BY_SPENDER_TYPE } from 'src/engine/core-modules/usage-limit/constants/usage-spender-column-by-spender-type.constant';
import { type QuotaOperationScope } from 'src/engine/core-modules/usage-limit/types/quota-operation-scope.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export type UsageScopeFilter = {
  clause: string;
  params: Record<string, string | string[]>;
};

export const buildUsageScopeFilter = ({
  operationType,
  unit,
  spenderType,
  spenderId,
}: {
  operationType: QuotaOperationScope;
  unit: UsageUnit | null;
  spenderType: SpenderType;
  spenderId: string | null;
}): UsageScopeFilter => {
  const clauses: string[] = [];
  const params: Record<string, string | string[]> = {};

  if (Array.isArray(operationType)) {
    clauses.push('AND operationType IN ({operationTypes:Array(String)})');
    params.operationTypes = operationType;
  } else if (operationType !== UsageOperationType.ALL) {
    clauses.push('AND operationType = {operationType:String}');
    params.operationType = operationType;
  }

  if (isDefined(unit)) {
    clauses.push('AND unit = {unit:String}');
    params.unit = unit;
  }

  if (spenderType !== 'workspace') {
    const spenderColumn = USAGE_SPENDER_COLUMN_BY_SPENDER_TYPE[spenderType];

    if (isDefined(spenderId)) {
      clauses.push(`AND ${spenderColumn} = {spenderId:String}`);
      params.spenderId = spenderId;
    } else {
      clauses.push(`AND ${spenderColumn} != ''`);
    }
  }

  return { clause: clauses.join('\n'), params };
};
