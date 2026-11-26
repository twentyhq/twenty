import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { VALIDATION_RULE_KEYWORDS } from '@/validation-rules/constants/ValidationRuleKeywords';
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

const compute = ({
  textBeforeCursor,
  fieldPathBeforeCursor,
}: {
  textBeforeCursor: string;
  fieldPathBeforeCursor?: string;
}) => {
  const { replaceFromOffset, items } = computeValidationRuleHelperContext({
    textBeforeCursor,
    fieldPathBeforeCursor,
    fields,
  });

  return { replaceFromOffset, names: items.map(getItemName) };
};

describe('computeValidationRuleHelperContext', () => {
  it('should offer fields first, then functions and keywords, on an empty condition', () => {
    const { replaceFromOffset, names } = compute({ textBeforeCursor: '' });

    expect(replaceFromOffset).toBe(0);
    expect(names.indexOf('amount')).toBeLessThan(names.indexOf('isDefined'));
    expect(names.indexOf('isDefined')).toBeLessThan(names.indexOf('and'));
  });

  it('should hide system fields until something is typed', () => {
    expect(compute({ textBeforeCursor: '' }).names).not.toContain('createdAt');
    expect(compute({ textBeforeCursor: 'crea' }).names).toContain('createdAt');
  });

  it('should filter by the word before the cursor and replace only that word', () => {
    const { replaceFromOffset, names } = compute({
      textBeforeCursor: 'isDefined(amo',
    });

    expect(replaceFromOffset).toBe('isDefined('.length);
    expect(names).toEqual(['amount']);
  });

  it('should offer relation members after a dot and replace the whole path', () => {
    const { replaceFromOffset, names } = compute({
      textBeforeCursor: 'stage == "X" and company.emp',
    });

    expect(replaceFromOffset).toBe('stage == "X" and '.length);
    expect(names).toEqual(['company.employees']);
  });

  it('should offer composite subfields after a dot', () => {
    expect(compute({ textBeforeCursor: 'amount.' }).names).toEqual([
      'amount.amountMicros',
      'amount.currencyCode',
    ]);
  });

  it('should offer previous among the keywords', () => {
    expect(compute({ textBeforeCursor: 'prev' }).names).toContain('previous');
  });

  it('should offer own fields after previous and replace the whole path', () => {
    const { replaceFromOffset, names } = compute({
      textBeforeCursor: 'stage != previous.sta',
    });

    expect(replaceFromOffset).toBe('stage != '.length);
    expect(names).toEqual(['previous.stage']);
  });

  it('should hide system fields after previous until something is typed', () => {
    expect(compute({ textBeforeCursor: 'previous.' }).names).toContain(
      'previous.amount',
    );
    expect(compute({ textBeforeCursor: 'previous.' }).names).not.toContain(
      'previous.createdAt',
    );
    expect(compute({ textBeforeCursor: 'previous.crea' }).names).toContain(
      'previous.createdAt',
    );
  });

  it('should offer composite subfields of a previous value', () => {
    expect(compute({ textBeforeCursor: 'previous.amount.' }).names).toEqual([
      'previous.amount.amountMicros',
      'previous.amount.currencyCode',
    ]);
  });

  it('should offer nothing inside a string', () => {
    expect(compute({ textBeforeCursor: 'stage == "amo' }).names).toEqual([]);
  });

  it('should offer the members of a relation chip and replace the chip', () => {
    const { replaceFromOffset, names } = compute({
      textBeforeCursor: 'isDefined(company',
      fieldPathBeforeCursor: 'company',
    });

    expect(replaceFromOffset).toBe('isDefined('.length);
    expect(names).toContain('company.employees');
    expect(names).not.toContain('amount');
  });

  it('should offer only keywords after a chip without members', () => {
    const { names } = compute({
      textBeforeCursor: 'closeDate',
      fieldPathBeforeCursor: 'closeDate',
    });

    expect(names).toContain('and');
    expect(names).not.toContain('closeDate');
    expect(names).not.toContain('isDefined');
  });

  it('should offer neither previous nor its fields when the keywords leave it out', () => {
    const keywordDefinitions = VALIDATION_RULE_KEYWORDS.filter(
      ({ name }) => name !== 'previous',
    );

    expect(
      computeValidationRuleHelperContext({
        textBeforeCursor: 'prev',
        fields,
        keywordDefinitions,
      }).items,
    ).toEqual([]);
    expect(
      computeValidationRuleHelperContext({
        textBeforeCursor: 'previous.',
        fields,
        keywordDefinitions,
      }).items,
    ).toEqual([]);
  });
});
