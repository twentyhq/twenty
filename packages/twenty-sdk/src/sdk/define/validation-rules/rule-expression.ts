import {
  VALIDATION_RULE_FUNCTIONS,
  VALIDATION_RULE_NOW_VARIABLE_NAME,
} from 'twenty-shared/constants';

export type RuleExpression = {
  readonly source: string;
  readonly isCompound: boolean;
};

export type RuleExpressionOperand = RuleExpression | string | number | boolean;

type RuleExpressionOperands<TParameters extends unknown[]> = {
  [TIndex in keyof TParameters]: RuleExpressionOperand;
};

type RuleExpressionFunctionBuilders = {
  [TName in keyof typeof VALIDATION_RULE_FUNCTIONS]: (
    ...operands: RuleExpressionOperands<
      Parameters<(typeof VALIDATION_RULE_FUNCTIONS)[TName]['evaluate']>
    >
  ) => RuleExpression;
};

const isRuleExpression = (
  operand: RuleExpressionOperand,
): operand is RuleExpression => typeof operand === 'object';

const toLiteral = (value: string | number | boolean): string =>
  JSON.stringify(value);

const toSource = (operand: RuleExpressionOperand): string => {
  if (!isRuleExpression(operand)) {
    return toLiteral(operand);
  }

  return operand.isCompound ? `(${operand.source})` : operand.source;
};

const buildAtom = (source: string): RuleExpression => ({
  source,
  isCompound: false,
});

const buildCompound = (source: string): RuleExpression => ({
  source,
  isCompound: true,
});

const buildBinary =
  (operator: string) =>
  (left: RuleExpressionOperand, right: RuleExpressionOperand) =>
    buildCompound(`${toSource(left)} ${operator} ${toSource(right)}`);

const buildLogical =
  (operator: string) =>
  (...operands: RuleExpressionOperand[]) =>
    operands.length === 1 && isRuleExpression(operands[0])
      ? operands[0]
      : buildCompound(operands.map(toSource).join(` ${operator} `));

const functionBuilders = Object.fromEntries(
  Object.keys(VALIDATION_RULE_FUNCTIONS).map((name) => [
    name,
    (...operands: RuleExpressionOperand[]) =>
      buildAtom(`${name}(${operands.map(toSource).join(', ')})`),
  ]),
) as unknown as RuleExpressionFunctionBuilders;

export const ruleExpression = {
  ...functionBuilders,
  field: (path: string) => buildAtom(path),
  now: buildAtom(VALIDATION_RULE_NOW_VARIABLE_NAME),
  and: buildLogical('and'),
  or: buildLogical('or'),
  not: (operand: RuleExpressionOperand) =>
    buildCompound(`not ${toSource(operand)}`),
  eq: buildBinary('=='),
  notEq: buildBinary('!='),
  gt: buildBinary('>'),
  gte: buildBinary('>='),
  lt: buildBinary('<'),
  lte: buildBinary('<='),
  add: buildBinary('+'),
  subtract: buildBinary('-'),
  multiply: buildBinary('*'),
  divide: buildBinary('/'),
  isIn: (
    value: RuleExpressionOperand,
    list: readonly (string | number | boolean)[],
  ) =>
    buildCompound(`${toSource(value)} in [${list.map(toLiteral).join(', ')}]`),
};
