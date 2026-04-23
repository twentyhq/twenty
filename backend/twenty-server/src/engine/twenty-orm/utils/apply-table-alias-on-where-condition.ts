import { isArray, isObject, isString } from '@sniptt/guards';
import {
  type WhereClause,
  type WhereClauseCondition,
} from 'typeorm/query-builder/WhereClause';

type ApplyTableAliasOnWhereConditionParams = {
  condition: WhereClauseCondition;
  tableName: string;
  aliasName: string;
};

export const applyTableAliasOnWhereCondition = ({
  condition,
  tableName,
  aliasName,
}: ApplyTableAliasOnWhereConditionParams): WhereClauseCondition => {
  if (isString(condition)) {
    const conditionParts = condition.split('.');

    if (conditionParts.length === 1) {
      return condition;
    }

    const [tableNamePart, ...rest] = conditionParts;

    return `${tableNamePart.replace(aliasName, tableName)}.${rest.join('.')}`;
  }

  if (isArray(condition)) {
    return condition.map((where: WhereClause) => {
      return {
        ...where,
        condition: applyTableAliasOnWhereCondition({
          condition: where.condition,
          tableName,
          aliasName,
        }),
      };
    });
  }

  if (isObject(condition)) {
    if ('condition' in condition) {
      return {
        ...condition,
        condition: applyTableAliasOnWhereCondition({
          condition: condition.condition,
          tableName,
          aliasName,
        }),
      };
    }

    if ('operator' in condition) {
      return condition;
    }
  }

  return condition;
};
