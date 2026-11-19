import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { changeConditionalAvailabilityRowOperator } from '@/conditional-availability/utils/changeConditionalAvailabilityRowOperator';

const memberRow = ({
  operator,
  values,
}: Pick<
  ConditionalAvailabilityRow,
  'operator' | 'values'
>): ConditionalAvailabilityRow => ({
  id: 'row-1',
  subject: 'workspaceMember',
  operator,
  values,
});

describe('changeConditionalAvailabilityRowOperator', () => {
  it('should keep the value when the new operator takes a list', () => {
    expect(
      changeConditionalAvailabilityRowOperator({
        row: memberRow({ operator: 'is', values: ['member-1'] }),
        operator: 'isAnyOf',
      }),
    ).toEqual(memberRow({ operator: 'isAnyOf', values: ['member-1'] }));
  });

  it('should clear a list of several values when the new operator takes one', () => {
    expect(
      changeConditionalAvailabilityRowOperator({
        row: memberRow({
          operator: 'isAnyOf',
          values: ['member-1', 'member-2'],
        }),
        operator: 'is',
      }),
    ).toEqual(memberRow({ operator: 'is', values: [] }));
  });
});
