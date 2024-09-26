// Generate test for getCombinedViewFilters

import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { getCombinedViewFilters } from '../getCombinedViewFilters';

describe('getCombinedViewFilters', () => {
  it('should return expected combined view filters when additional filters are present', () => {
    const viewFilters: ViewFilter[] = [
      {
        __typename: 'ViewFilter',
        id: 'id',
        fieldMetadataId: '05731f68-6e7a-4903-8374-c0b6a9063482',
        value: 'testValue',
        displayValue: 'Test Display Value',
        operand: ViewFilterOperand.Is,
      },
    ];
    const toUpsertViewFilters: ViewFilter[] = [
      {
        __typename: 'ViewFilter',
        id: 'id',
        fieldMetadataId: '05731f68-6e7a-4903-8374-c0b6a9063482',
        value: 'testValue',
        displayValue: 'Test Display Value',
        operand: ViewFilterOperand.Is,
      },
    ];
    const toDeleteViewFilterIds: string[] = [];

    expect(
      getCombinedViewFilters(
        viewFilters,
        toUpsertViewFilters,
        toDeleteViewFilterIds,
      ),
    ).toEqual([
      {
        __typename: 'ViewFilter',
        id: 'id',
        fieldMetadataId: '05731f68-6e7a-4903-8374-c0b6a9063482',
        value: 'testValue',
        displayValue: 'Test Display Value',
        operand: ViewFilterOperand.Is,
      },
    ]);
  });

  it('should return expected combined view filters when additional filters are not present', () => {
    const viewFilters: ViewFilter[] = [
      {
        __typename: 'ViewFilter',
        id: 'id',
        fieldMetadataId: '05731f68-6e7a-4903-8374-c0b6a9063482',
        value: 'testValue',
        displayValue: 'Test Display Value',
        operand: ViewFilterOperand.Is,
      },
    ];
    const toUpsertViewFilters: ViewFilter[] = [];
    const toDeleteViewFilterIds: string[] = [];

    expect(
      getCombinedViewFilters(
        viewFilters,
        toUpsertViewFilters,
        toDeleteViewFilterIds,
      ),
    ).toEqual([
      {
        __typename: 'ViewFilter',
        id: 'id',
        fieldMetadataId: '05731f68-6e7a-4903-8374-c0b6a9063482',
        value: 'testValue',
        displayValue: 'Test Display Value',
        operand: ViewFilterOperand.Is,
      },
    ]);
  });

  it('should return expected combined view filters when additional filters are present and some filters are to be deleted', () => {
    const viewFilters: ViewFilter[] = [
      {
        __typename: 'ViewFilter',
        id: 'id',
        fieldMetadataId: '05731f68-6e7a-4903-8374-c0b6a9063482',
        value: 'testValue',
        displayValue: 'Test Display Value',
        operand: ViewFilterOperand.Is,
      },
    ];
    const toUpsertViewFilters: ViewFilter[] = [
      {
        __typename: 'ViewFilter',
        id: 'id',
        fieldMetadataId: '05731f68-6e7a-4903-8374-c0b6a9063482',
        value: 'testValue',
        displayValue: 'Test Display Value',
        operand: ViewFilterOperand.Is,
      },
    ];
    const toDeleteViewFilterIds: string[] = ['id'];

    expect(
      getCombinedViewFilters(
        viewFilters,
        toUpsertViewFilters,
        toDeleteViewFilterIds,
      ),
    ).toEqual([]);
  });
});
