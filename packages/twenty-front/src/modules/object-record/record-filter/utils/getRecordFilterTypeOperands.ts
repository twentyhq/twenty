import { ViewFilterOperand as RecordFilterOperand } from '@/views/types/ViewFilterOperand';

const emptyOperands = [
  RecordFilterOperand.IsEmpty,
  RecordFilterOperand.IsNotEmpty,
] as const;

const relationOperands = [
  RecordFilterOperand.Is,
  RecordFilterOperand.IsNot,
] as const;

export const recordFilterTypeOperands = [
  {
    type: 'TEXT',
    operands: [
      RecordFilterOperand.Contains,
      RecordFilterOperand.DoesNotContain,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'EMAILS',
    operands: [
      RecordFilterOperand.Contains,
      RecordFilterOperand.DoesNotContain,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'FULL_NAME',
    operands: [
      RecordFilterOperand.Contains,
      RecordFilterOperand.DoesNotContain,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'ADDRESS',
    operands: [
      RecordFilterOperand.Contains,
      RecordFilterOperand.DoesNotContain,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'LINKS',
    operands: [
      RecordFilterOperand.Contains,
      RecordFilterOperand.DoesNotContain,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'PHONES',
    operands: [
      RecordFilterOperand.Contains,
      RecordFilterOperand.DoesNotContain,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'CURRENCY',
    operands: [
      RecordFilterOperand.GreaterThan,
      RecordFilterOperand.LessThan,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'NUMBER',
    operands: [
      RecordFilterOperand.GreaterThan,
      RecordFilterOperand.LessThan,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'RAW_JSON',
    operands: [
      RecordFilterOperand.Contains,
      RecordFilterOperand.DoesNotContain,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'DATE_TIME',
    operands: [
      RecordFilterOperand.Is,
      RecordFilterOperand.IsRelative,
      RecordFilterOperand.IsInPast,
      RecordFilterOperand.IsInFuture,
      RecordFilterOperand.IsToday,
      RecordFilterOperand.IsBefore,
      RecordFilterOperand.IsAfter,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'DATE',
    operands: [
      RecordFilterOperand.Is,
      RecordFilterOperand.IsRelative,
      RecordFilterOperand.IsInPast,
      RecordFilterOperand.IsInFuture,
      RecordFilterOperand.IsToday,
      RecordFilterOperand.IsBefore,
      RecordFilterOperand.IsAfter,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'RATING',
    operands: [
      RecordFilterOperand.Is,
      RecordFilterOperand.GreaterThan,
      RecordFilterOperand.LessThan,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'RELATION',
    operands: [...relationOperands, ...emptyOperands] as const,
  },
  {
    type: 'MULTI_SELECT',
    operands: [
      RecordFilterOperand.Contains,
      RecordFilterOperand.DoesNotContain,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'SELECT',
    operands: [
      RecordFilterOperand.Is,
      RecordFilterOperand.IsNot,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'ACTOR',
    operands: [
      RecordFilterOperand.Contains,
      RecordFilterOperand.DoesNotContain,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'ARRAY',
    operands: [
      RecordFilterOperand.Contains,
      RecordFilterOperand.DoesNotContain,
      ...emptyOperands,
    ] as const,
  },
  {
    type: 'BOOLEAN',
    operands: [RecordFilterOperand.Is] as const,
  },
] as const;

export type RecordFilterTypeOperand = (typeof recordFilterTypeOperands)[number];
export type AllRecordFilterType = RecordFilterTypeOperand['type'];

export type FilterOperands<T extends AllRecordFilterType> = Extract<
  RecordFilterTypeOperand,
  { type: T }
>['operands'][number];

export type FilterTypeToOperands = {
  [K in (typeof recordFilterTypeOperands)[number]['type']]: Extract<
    (typeof recordFilterTypeOperands)[number],
    { type: K }
  >['operands'][number];
};
