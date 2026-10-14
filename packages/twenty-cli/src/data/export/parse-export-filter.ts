import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

type FilterValue = string | FilterValue[] | { [key: string]: FilterValue };
type Filter = Record<string, FilterValue>;

const COMPARATORS = [
  'eq',
  'neq',
  'in',
  'containsAny',
  'is',
  'gt',
  'gte',
  'lt',
  'lte',
  'startsWith',
  'endsWith',
  'like',
  'ilike',
];
const invalidFilter = () =>
  new CliError({
    code: 'USAGE',
    exitCode: EXIT_CODE.USAGE,
    message: 'Invalid REST filter expression.',
    hint: 'Use field[operator]:value, for example employees[gte]:5000 or and(tier[eq]:GOLD,employees[gte]:5000).',
  });

const splitPredicates = (expression: string) => {
  const parts: string[] = [];
  let start = 0;
  let parentheses = 0;
  let brackets = 0;
  let quote = '';
  let isValue = false;
  let isArrayValue = false;
  for (let index = 0; index < expression.length; index++) {
    const character = expression[index];
    if (isNonEmptyString(quote)) {
      if (character === quote) {
        quote = '';
      }
      continue;
    }
    if (
      (character === '"' || character === "'") &&
      (index === 0 || [':', '[', ','].includes(expression[index - 1]))
    ) {
      quote = character;
      continue;
    }
    if (character === '(') {
      parentheses++;
      isValue = false;
    }
    if (character === ')') {
      parentheses--;
      isValue = false;
    }
    if (character === ':' && expression[index - 1] === ']') {
      isValue = true;
      isArrayValue = /\[(in|containsAny)\]$/.test(expression.slice(0, index));
    }
    if (
      character === '[' &&
      (!isValue || (isArrayValue && expression[index - 1] === ':'))
    ) {
      brackets++;
    }
    if (character === ']' && (!isValue || brackets > 0)) {
      brackets--;
    }
    if (character === ',' && brackets === 0) {
      isValue = false;
    }
    if (parentheses < 0 || brackets < 0) {
      throw invalidFilter();
    }
    if (character === ',' && parentheses === 0 && brackets === 0) {
      parts.push(expression.slice(start, index));
      start = index + 1;
    }
  }
  if (parentheses !== 0 || brackets !== 0 || isNonEmptyString(quote)) {
    throw invalidFilter();
  }
  parts.push(expression.slice(start));
  return parts;
};

const unquote = (value: string) =>
  (value.startsWith('"') || value.startsWith("'")) &&
  (value.endsWith('"') || value.endsWith("'"))
    ? value.slice(1, -1)
    : value;

const parseFilterValue = ({
  comparator,
  text,
}: {
  comparator: string;
  text: string;
}): FilterValue => {
  if (comparator !== 'in' && comparator !== 'containsAny') {
    return comparator === 'is' ? text : unquote(text);
  }
  if (!text.startsWith('[') || !text.endsWith(']')) {
    throw invalidFilter();
  }
  return text.slice(1, -1).split(',').map(unquote);
};

const parsePredicate = ({
  expression,
  depth,
}: {
  expression: string;
  depth: number;
}): Filter => {
  if (depth > 50) {
    throw invalidFilter();
  }
  const conjunction = /^(and|or|not)\((.+)\)$/.exec(expression);
  if (isDefined(conjunction)) {
    const predicates = splitPredicates(conjunction[2]).map((part) =>
      parsePredicate({ expression: part, depth: depth + 1 }),
    );
    if (conjunction[1] === 'not') {
      if (predicates.length !== 1) {
        throw invalidFilter();
      }
      return { not: predicates[0] };
    }
    return { [conjunction[1]]: predicates };
  }
  const condition = /^([^\[\]]+)\[([^\[\]]+)\]:(.+)$/.exec(expression);
  if (!isDefined(condition) || !COMPARATORS.includes(condition[2])) {
    throw invalidFilter();
  }
  const [, field, comparator, text] = condition;
  const value = parseFilterValue({ comparator, text });
  return field
    .split('.')
    .reverse()
    .reduce<Filter>(
      (nested, name) => {
        if (name.length === 0) {
          throw invalidFilter();
        }
        return { [name]: nested };
      },
      { [comparator]: value },
    );
};

export const parseExportFilter = (expression: string): Filter => {
  const predicates = splitPredicates(expression);
  return predicates.length === 1 && /^(and|or|not)\(/.test(expression)
    ? parsePredicate({ expression, depth: 0 })
    : {
        and: predicates.map((part) =>
          parsePredicate({ expression: part, depth: 0 }),
        ),
      };
};
