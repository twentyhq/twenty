import { isDefined } from 'twenty-shared/utils';

type CalcExpressionCursor = {
  expression: string;
  index: number;
};

const LEADING_WHITESPACE_PATTERN = /^\s*/;

const LEADING_NUMBER_WITH_UNIT_PATTERN =
  /^(-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(px|%)?/i;

const peekCharacter = (cursor: CalcExpressionCursor): string | undefined => {
  const whitespaceLength =
    LEADING_WHITESPACE_PATTERN.exec(cursor.expression.slice(cursor.index))?.[0]
      .length ?? 0;

  cursor.index += whitespaceLength;

  return cursor.expression[cursor.index];
};

const parseOperand = ({
  cursor,
  referenceSize,
}: {
  cursor: CalcExpressionCursor;
  referenceSize: number;
}): number => {
  const nextCharacter = peekCharacter(cursor);

  if (nextCharacter === '(') {
    cursor.index += 1;
    const value = parseSum({ cursor, referenceSize });

    if (peekCharacter(cursor) !== ')') {
      return Number.NaN;
    }

    cursor.index += 1;

    return value;
  }

  const match = LEADING_NUMBER_WITH_UNIT_PATTERN.exec(
    cursor.expression.slice(cursor.index),
  );

  if (!isDefined(match)) {
    return Number.NaN;
  }

  cursor.index += match[0].length;
  const value = Number.parseFloat(match[1]);

  return match[2] === '%' ? (value * referenceSize) / 100 : value;
};

const parseProduct = ({
  cursor,
  referenceSize,
}: {
  cursor: CalcExpressionCursor;
  referenceSize: number;
}): number => {
  let value = parseOperand({ cursor, referenceSize });

  for (
    let operator = peekCharacter(cursor);
    operator === '*' || operator === '/';
    operator = peekCharacter(cursor)
  ) {
    cursor.index += 1;
    const operand = parseOperand({ cursor, referenceSize });

    value = operator === '*' ? value * operand : value / operand;
  }

  return value;
};

const parseSum = ({
  cursor,
  referenceSize,
}: {
  cursor: CalcExpressionCursor;
  referenceSize: number;
}): number => {
  let value = parseProduct({ cursor, referenceSize });

  for (
    let operator = peekCharacter(cursor);
    operator === '+' || operator === '-';
    operator = peekCharacter(cursor)
  ) {
    cursor.index += 1;
    const operand = parseProduct({ cursor, referenceSize });

    value = operator === '+' ? value + operand : value - operand;
  }

  return value;
};

export const resolveCssCalcExpressionInPixels = ({
  expression,
  referenceSize,
}: {
  expression: string;
  referenceSize: number;
}): number => {
  const cursor: CalcExpressionCursor = { expression, index: 0 };
  const value = parseSum({ cursor, referenceSize });
  const isFullyConsumed =
    !isDefined(peekCharacter(cursor)) && cursor.index === expression.length;

  return isFullyConsumed && Number.isFinite(value) ? value : 0;
};
