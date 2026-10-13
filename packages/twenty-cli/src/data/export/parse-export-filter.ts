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
  for (let index = 0; index < expression.length; index++) {
    const character = expression[index];
    if (quote) {
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
    }
    if (character === ')') {
      parentheses--;
    }
    if (character === '[') {
      brackets++;
    }
    if (character === ']') {
      brackets--;
    }
    if (parentheses < 0 || brackets < 0) {
      throw invalidFilter();
    }
    if (character === ',' && parentheses === 0 && brackets === 0) {
      parts.push(expression.slice(start, index));
      start = index + 1;
    }
  }
  if (parentheses !== 0 || brackets !== 0 || quote) {
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

const parsePredicate = (expression: string, depth: number): Filter => {
  if (depth > 50) {
    throw invalidFilter();
  }
  const conjunction = /^(and|or|not)\((.+)\)$/.exec(expression);
  if (conjunction) {
    const predicates = splitPredicates(conjunction[2]).map((part) =>
      parsePredicate(part, depth + 1),
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
  if (!condition || !COMPARATORS.includes(condition[2])) {
    throw invalidFilter();
  }
  const [, field, comparator, text] = condition;
  let value: FilterValue = comparator === 'is' ? text : unquote(text);
  if (comparator === 'in' || comparator === 'containsAny') {
    if (!text.startsWith('[') || !text.endsWith(']')) {
      throw invalidFilter();
    }
    value = text.slice(1, -1).split(',').map(unquote);
  }
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
    ? parsePredicate(expression, 0)
    : { and: predicates.map((part) => parsePredicate(part, 0)) };
};
