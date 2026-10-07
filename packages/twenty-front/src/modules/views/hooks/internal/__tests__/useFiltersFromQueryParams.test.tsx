import { useFiltersFromQueryParams } from '@/views/hooks/internal/useFiltersFromQueryParams';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const getFieldIdByNameOrThrow = (fieldName: string) => {
  const field = companyObjectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Expected the company mock to have a ${fieldName} field`);
  }

  return field.id;
};

// The shape a chart drilldown produces: the chart's own group plus a parentless dashboard filter.
const URL_WITH_BOTH_SHAPES =
  '/objects/companies?filterGroup[operator]=OR&filterGroup[filters][0][field]=name&filterGroup[filters][0][op]=CONTAINS&filterGroup[filters][0][value]=Acme&filterGroup[filters][1][field]=employees&filterGroup[filters][1][op]=GREATER_THAN_OR_EQUAL&filterGroup[filters][1][value]=10&filter[createdAt][IS_RELATIVE]=THIS_1_MONTH';

const renderUseFiltersFromQueryParams = (initialEntry: string) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JestObjectMetadataItemSetter>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/objects/:objectNamePlural" element={children} />
        </Routes>
      </MemoryRouter>
    </JestObjectMetadataItemSetter>
  );

  return renderHook(() => useFiltersFromQueryParams(), { wrapper: Wrapper });
};

describe('useFiltersFromQueryParams', () => {
  it('reads the parentless filters and the filter group from the same URL', async () => {
    const { result } = renderUseFiltersFromQueryParams(URL_WITH_BOTH_SHAPES);

    const [filters, filterGroups] = await Promise.all([
      result.current.getFiltersFromQueryParams(),
      result.current.getFilterGroupsFromQueryParams(),
    ]);

    expect(filters).toEqual([
      expect.objectContaining({
        fieldMetadataId: getFieldIdByNameOrThrow('createdAt'),
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'THIS_1_MONTH',
      }),
    ]);

    expect(filterGroups.recordFilterGroups).toHaveLength(1);
    expect(filterGroups.recordFilterGroups[0].logicalOperator).toBe('OR');
    expect(filterGroups.recordFilters).toEqual([
      expect.objectContaining({
        fieldMetadataId: getFieldIdByNameOrThrow('name'),
        operand: ViewFilterOperand.CONTAINS,
        value: 'Acme',
        recordFilterGroupId: filterGroups.recordFilterGroups[0].id,
      }),
      expect.objectContaining({
        fieldMetadataId: getFieldIdByNameOrThrow('employees'),
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: '10',
        recordFilterGroupId: filterGroups.recordFilterGroups[0].id,
      }),
    ]);
  });

  it('returns only the parentless filters when the URL has no group', async () => {
    const { result } = renderUseFiltersFromQueryParams(
      '/objects/companies?filter[createdAt][IS_RELATIVE]=THIS_1_MONTH',
    );

    const [filters, filterGroups] = await Promise.all([
      result.current.getFiltersFromQueryParams(),
      result.current.getFilterGroupsFromQueryParams(),
    ]);

    expect(filters).toHaveLength(1);
    expect(filterGroups).toEqual({ recordFilters: [], recordFilterGroups: [] });
  });

  it('returns only the group when the URL has no parentless filter', async () => {
    const { result } = renderUseFiltersFromQueryParams(
      '/objects/companies?filterGroup[operator]=AND&filterGroup[filters][0][field]=name&filterGroup[filters][0][op]=CONTAINS&filterGroup[filters][0][value]=Acme',
    );

    const [filters, filterGroups] = await Promise.all([
      result.current.getFiltersFromQueryParams(),
      result.current.getFilterGroupsFromQueryParams(),
    ]);

    expect(filters).toEqual([]);
    expect(filterGroups.recordFilters).toHaveLength(1);
    expect(filterGroups.recordFilterGroups).toHaveLength(1);
  });
});
