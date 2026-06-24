import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/mergeDefaultFunctionInputAndFunctionInput';

describe('mergeDefaultFunctionInputAndFunctionInput', () => {
  it('should merge properly', () => {
    const newInput = {
      a: null,
      b: null,
      c: { cc: null },
      d: null,
      e: { ee: null },
    };
    const oldInput = { a: 'a', c: 'c', d: { da: null }, e: { ee: 'ee' } };
    const expectedResult = {
      a: 'a',
      b: null,
      c: { cc: null },
      d: null,
      e: { ee: 'ee' },
    };
    expect(
      mergeDefaultFunctionInputAndFunctionInput({
        newInput: newInput,
        oldInput: oldInput,
      }),
    ).toEqual(expectedResult);
  });

  it('should preserve array values without recursing into them as nested objects', () => {
    const newInput = { briefs: [], b: null };
    const oldInput = { briefs: [], b: 5 };

    expect(
      mergeDefaultFunctionInputAndFunctionInput({
        newInput,
        oldInput,
      }),
    ).toEqual({ briefs: [], b: 5 });
  });

  it('should keep an array typed by the user instead of resetting it', () => {
    const newInput = { briefs: [], b: null };
    const oldInput = { briefs: '["a", "b"]', b: null };

    expect(
      mergeDefaultFunctionInputAndFunctionInput({
        newInput,
        oldInput,
      }),
    ).toEqual({ briefs: '["a", "b"]', b: null });
  });

  it('should preserve stored record values for record-typed inputs', () => {
    const newInput = { company: null, people: [] };
    const oldInput = {
      company: '20202020-aaaa-4bbb-8ccc-111111111111',
      people: ['20202020-aaaa-4bbb-8ccc-222222222222', '{{trigger.record.id}}'],
    };

    expect(
      mergeDefaultFunctionInputAndFunctionInput({
        newInput,
        oldInput,
      }),
    ).toEqual(oldInput);
  });

  it('should reset stale empty objects to null for record-typed inputs', () => {
    const newInput = { company: null };
    const oldInput = { company: {} };

    expect(
      mergeDefaultFunctionInputAndFunctionInput({
        newInput,
        oldInput,
      }),
    ).toEqual({ company: null });
  });
});
