import { isNonEmptyString } from '@sniptt/guards';
import { type JSONSchema7 } from 'json-schema';

const NULL_CHECK_REFERENCE: JSONSchema7 = { $ref: '#/$defs/NullCheck' };

const stringOperator = ({
  description,
  format,
}: {
  description: string;
  format?: string;
}): JSONSchema7 => ({
  description,
  type: 'string',
  ...(isNonEmptyString(format) && { format }),
});

const numberOperator = (description: string): JSONSchema7 => ({
  description,
  type: 'number',
});

const inOperator = ({
  items,
  description = 'In array',
}: {
  items: JSONSchema7;
  description?: string;
}): JSONSchema7 => ({ description, type: 'array', items });

const textFilter = ({
  format,
  hasAffixOperators = false,
  hasInOperator = false,
}: {
  format?: string;
  hasAffixOperators?: boolean;
  hasInOperator?: boolean;
} = {}): JSONSchema7 => ({
  type: 'object',
  properties: {
    eq: stringOperator({ description: 'Equals', format }),
    neq: stringOperator({ description: 'Not equals', format }),
    ...(hasInOperator && { in: inOperator({ items: { type: 'string' } }) }),
    like: stringOperator({ description: 'LIKE (% wildcard)' }),
    ilike: stringOperator({
      description: 'ILIKE (% wildcard, case-insensitive)',
    }),
    ...(hasAffixOperators && {
      startsWith: stringOperator({ description: 'Starts with' }),
      endsWith: stringOperator({ description: 'Ends with' }),
    }),
    is: NULL_CHECK_REFERENCE,
  },
});

const NUMBER_FILTER: JSONSchema7 = {
  type: 'object',
  properties: {
    eq: numberOperator('Equals'),
    neq: numberOperator('Not equals'),
    gt: numberOperator('>'),
    gte: numberOperator('>='),
    lt: numberOperator('<'),
    lte: numberOperator('<='),
    in: inOperator({ items: { type: 'number' } }),
    is: NULL_CHECK_REFERENCE,
  },
};

const dateTimeOperator = (description: string): JSONSchema7 =>
  stringOperator({ description, format: 'date-time' });

const uuidOperator = (description: string): JSONSchema7 =>
  stringOperator({ description, format: 'uuid' });

export const SHARED_FILTER_JSON_SCHEMAS = {
  NullCheck: {
    description: 'Is null or not null',
    type: 'string',
    enum: ['NULL', 'NOT_NULL'],
  },
  TextFilter: textFilter({ hasAffixOperators: true, hasInOperator: true }),
  NumberFilter: NUMBER_FILTER,
  DateFilter: {
    type: 'object',
    properties: {
      eq: dateTimeOperator('Equals (ISO datetime)'),
      neq: dateTimeOperator('Not equals (ISO datetime)'),
      gt: dateTimeOperator('> ISO datetime'),
      gte: dateTimeOperator('>= ISO datetime'),
      lt: dateTimeOperator('< ISO datetime'),
      lte: dateTimeOperator('<= ISO datetime'),
      in: inOperator({
        items: { type: 'string', format: 'date-time' },
        description: 'In array (ISO datetimes)',
      }),
      is: NULL_CHECK_REFERENCE,
    },
  },
  BooleanFilter: {
    type: 'object',
    properties: {
      eq: { description: 'Equals', type: 'boolean' },
      is: NULL_CHECK_REFERENCE,
    },
  },
  UuidFilter: {
    type: 'object',
    properties: {
      eq: uuidOperator('Equals'),
      neq: uuidOperator('Not equals'),
      in: inOperator({
        items: { type: 'string', format: 'uuid' },
        description: 'In array of values',
      }),
      is: NULL_CHECK_REFERENCE,
    },
  },
  DefaultFilter: textFilter(),
  ArrayFilter: {
    type: 'object',
    properties: {
      containsIlike: stringOperator({
        description: 'Contains case-insensitive substring',
      }),
      is: NULL_CHECK_REFERENCE,
      isEmptyArray: { description: 'Is empty array', type: 'boolean' },
    },
  },
  LinksFilter: {
    type: 'object',
    properties: { primaryLinkUrl: textFilter({ format: 'uri' }) },
  },
  AddressFilter: {
    type: 'object',
    properties: {
      addressStreet1: textFilter(),
      addressCity: textFilter(),
      addressCountry: textFilter(),
    },
  },
  FullNameFilter: {
    type: 'object',
    properties: {
      firstName: textFilter({ hasAffixOperators: true }),
      lastName: textFilter({ hasAffixOperators: true }),
    },
  },
  EmailsFilter: {
    type: 'object',
    properties: { primaryEmail: textFilter({ format: 'email' }) },
  },
  PhonesFilter: {
    type: 'object',
    properties: { primaryPhoneNumber: textFilter() },
  },
  RichTextFilter: {
    type: 'object',
    properties: { markdown: textFilter({ hasAffixOperators: true }) },
  },
  CurrencyFilter: {
    type: 'object',
    properties: {
      amountMicros: {
        description:
          'Currency amount in micros (1 unit = 1,000,000 micros). Multiply the user-provided amount by 1,000,000 to build this filter.',
        ...NUMBER_FILTER,
      },
      currencyCode: {
        type: 'object',
        properties: {
          eq: stringOperator({ description: 'Equals' }),
          neq: stringOperator({ description: 'Not equals' }),
          in: inOperator({ items: { type: 'string' } }),
          is: NULL_CHECK_REFERENCE,
        },
      },
    },
  },
} satisfies Record<string, JSONSchema7>;
