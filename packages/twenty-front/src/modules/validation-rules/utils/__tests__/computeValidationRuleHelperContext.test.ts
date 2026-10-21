import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { computeValidationRuleHelperContext } from '@/validation-rules/utils/computeValidationRuleHelperContext';
import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const fields = buildValidationRuleEditorFields({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('opportunity'),
  objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
});

const getItemName = (item: ValidationRuleHelperItem) =>
  item.kind === 'field' ? item.field.path : item.definition.name;

const compute = (textBeforeCursor: string, isCursorAfterField = false) => {
  const { replaceFromOffset, items } = computeValidationRuleHelperContext({
    textBeforeCursor,
    isCursorAfterField,
    fields,
  });

  return { replaceFromOffset, names: items.map(getItemName) };
};

describe('computeValidationRuleHelperContext', () => {
  it('should offer fields first, then functions and keywords, on an empty condition', () => {
    const { replaceFromOffset, names } = compute('');

    expect(replaceFromOffset).toBe(0);
    expect(names.indexOf('amount')).toBeLessThan(names.indexOf('isDefined'));
    expect(names.indexOf('isDefined')).toBeLessThan(names.indexOf('and'));
  });

  it('should hide system fields until something is typed', () => {
    expect(compute('').names).not.toContain('createdAt');
    expect(compute('crea').names).toContain('createdAt');
  });

  it('should filter by the word before the cursor and replace only that word', () => {
    const { replaceFromOffset, names } = compute('isDefined(amo');

    expect(replaceFromOffset).toBe('isDefined('.length);
    expect(names).toEqual(['amount']);
  });

  it('should offer relation members after a dot and replace the whole path', () => {
    const { replaceFromOffset, names } = compute(
      'stage == "X" and company.emp',
    );

    expect(replaceFromOffset).toBe('stage == "X" and '.length);
    expect(names).toEqual(['company.employees']);
  });

  it('should offer composite subfields after a dot', () => {
    expect(compute('amount.').names).toEqual([
      'amount.amountMicros',
      'amount.currencyCode',
    ]);
  });

  it('should offer nothing inside a string', () => {
    expect(compute('stage == "amo').names).toEqual([]);
  });

  it('should offer everything right after a field chip', () => {
    expect(compute('amount', true).names).toContain('isDefined');
  });
});
