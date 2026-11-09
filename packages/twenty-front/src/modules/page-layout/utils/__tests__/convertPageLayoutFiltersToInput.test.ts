import { convertPageLayoutFiltersToInput } from '@/page-layout/utils/convertPageLayoutFiltersToInput';
import {
  type PageLayoutFilter,
  PageLayoutFilterType,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';

const DATE_RANGE_FILTER: PageLayoutFilter = {
  __typename: 'PageLayoutFilter',
  id: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01',
  label: 'Date range',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: {
    __typename: 'PageLayoutFilterValue',
    conditions: [
      {
        __typename: 'PageLayoutFilterCondition',
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'THIS_1_MONTH',
      },
    ],
  },
};

describe('convertPageLayoutFiltersToInput', () => {
  it('should send the filters without their GraphQL typenames', () => {
    expect(convertPageLayoutFiltersToInput([DATE_RANGE_FILTER])).toEqual([
      {
        id: DATE_RANGE_FILTER.id,
        label: 'Date range',
        type: PageLayoutFilterType.DATE,
        position: 0,
        defaultValue: {
          conditions: [
            { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_MONTH' },
          ],
        },
      },
    ]);
  });

  it('should send a filter without default value with a null default value', () => {
    const [filterInput] =
      convertPageLayoutFiltersToInput([
        { ...DATE_RANGE_FILTER, defaultValue: undefined },
      ]) ?? [];

    expect(filterInput.defaultValue).toBeNull();
  });

  it('should keep a layout without filters at null', () => {
    expect(convertPageLayoutFiltersToInput(null)).toBeNull();
  });
});
