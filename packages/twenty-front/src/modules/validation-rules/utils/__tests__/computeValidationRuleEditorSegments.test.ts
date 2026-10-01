import { computeValidationRuleEditorSegments } from '@/validation-rules/utils/computeValidationRuleEditorSegments';

const FIELD_PATHS = ['amount', 'stage', 'company', 'company.employees'];

const compute = ({
  expression,
  cursorOffset = null,
  fieldRanges = [],
}: {
  expression: string;
  cursorOffset?: number | null;
  fieldRanges?: { start: number; end: number }[];
}) =>
  computeValidationRuleEditorSegments({
    expression,
    isFieldPath: (path) => FIELD_PATHS.includes(path),
    cursorOffset,
    fieldRanges,
  });

describe('computeValidationRuleEditorSegments', () => {
  it('should turn known field paths into field segments', () => {
    expect(
      compute({ expression: 'isDefined(amount) and stage == "X"' }),
    ).toEqual([
      { type: 'text', text: 'isDefined(' },
      { type: 'field', path: 'amount' },
      { type: 'text', text: ') and ' },
      { type: 'field', path: 'stage' },
      { type: 'text', text: ' == "X"' },
    ]);
  });

  it('should keep a field name inside a string as text', () => {
    expect(compute({ expression: 'stage == "amount"' })).toEqual([
      { type: 'field', path: 'stage' },
      { type: 'text', text: ' == "amount"' },
    ]);
  });

  it('should keep the word being typed as text until the cursor leaves it', () => {
    expect(compute({ expression: 'amount', cursorOffset: 6 })).toEqual([
      { type: 'text', text: 'amount' },
    ]);
    expect(compute({ expression: 'amount ', cursorOffset: 7 })).toEqual([
      { type: 'field', path: 'amount' },
      { type: 'text', text: ' ' },
    ]);
  });

  it('should keep an existing field chip when the cursor sits right after it', () => {
    expect(
      compute({
        expression: 'amount',
        cursorOffset: 6,
        fieldRanges: [{ start: 0, end: 6 }],
      }),
    ).toEqual([{ type: 'field', path: 'amount' }]);
  });

  it('should merge a relation chip with the member typed after it', () => {
    expect(
      compute({
        expression: 'company.employees > 1',
        cursorOffset: 21,
        fieldRanges: [{ start: 0, end: 7 }],
      }),
    ).toEqual([
      { type: 'field', path: 'company.employees' },
      { type: 'text', text: ' > 1' },
    ]);
  });

  it('should leave unknown paths as text', () => {
    expect(compute({ expression: 'amont > 1' })).toEqual([
      { type: 'text', text: 'amont > 1' },
    ]);
  });
});
