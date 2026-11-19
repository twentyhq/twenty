import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { changeConditionalAvailabilityRowOperator } from '@/conditional-availability/utils/changeConditionalAvailabilityRowOperator';

const memberRow = (
  operator: ConditionalAvailabilityRow['operator'],
  values: string[],
): ConditionalAvailabilityRow => ({
  id: 'row-1',
  subject: 'workspaceMember',
  operator,
  values,
});

describe('changeConditionalAvailabilityRowOperator', () => {
  it('should keep the value when the new operator takes a list', () => {
    expect(
      changeConditionalAvailabilityRowOperator({
        row: memberRow('is', ['member-1']),
        operator: 'isAnyOf',
      }),
    ).toEqual(memberRow('isAnyOf', ['member-1']));
  });

  it('should clear a list of several values when the new operator takes one', () => {
    expect(
      changeConditionalAvailabilityRowOperator({
        row: memberRow('isAnyOf', ['member-1', 'member-2']),
        operator: 'is',
      }),
    ).toEqual(memberRow('is', []));
  });

  it('should clear the value when the new operator takes none', () => {
    expect(
      changeConditionalAvailabilityRowOperator({
        row: {
          id: 'row-1',
          subject: 'recordField',
          fieldMetadataUniversalIdentifier: 'field-1',
          fieldName: 'name',
          subFieldName: null,
          fieldKind: 'text',
          propertyPath: 'name',
          operator: 'contains',
          values: ['Acme'],
        },
        operator: 'isEmpty',
      }).values,
    ).toEqual([]);
  });
});
