import { expect } from '@storybook/test';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

const filterDropdownId = 'filterDropdownId';
const renderHookConfig = {
  wrapper: RecoilRoot,
};

const filterDefinitions: FilterDefinition[] = [
  {
    fieldMetadataId: 'id',
    label: 'definition label',
    iconName: 'icon',
    type: 'TEXT',
  },
];

const mockFilter: Filter = {
  definition: filterDefinitions[0],
  displayValue: '',
  fieldMetadataId: '',
  operand: ViewFilterOperand.Is,
  value: '',
};

describe('useFilterDropdown', () => {
  it('should set availableFilterDefinitions', async () => {
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );

    expect(result.current.availableFilterDefinitions).toEqual([]);

    act(() => {
      result.current.setAvailableFilterDefinitions(filterDefinitions);
    });

    await waitFor(() => {
      expect(result.current.availableFilterDefinitions).toEqual(
        filterDefinitions,
      );
    });
  });

  it('should set onFilterSelect', async () => {
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );

    expect(result.current.onFilterSelect).toBeUndefined();

    act(() => {
      result.current.setOnFilterSelect(
        (_currVal?: Filter | null) => (_filter: Filter | null) => {},
      );
    });
    await waitFor(() => {
      expect(typeof result.current.onFilterSelect).toBe('function');
    });
  });

  it('should set selectedOperandInDropdown', async () => {
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );
    const mockOperand = ViewFilterOperand.Contains;

    expect(result.current.selectedOperandInDropdown).toBeNull();

    act(() => {
      result.current.setSelectedOperandInDropdown(mockOperand);
    });

    expect(result.current.selectedOperandInDropdown).toBe(mockOperand);
  });

  it('should set selectedFilter', async () => {
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );

    expect(result.current.selectedFilter).toBeUndefined();

    act(() => {
      result.current.setSelectedFilter(mockFilter);
    });

    await waitFor(() => {
      expect(result.current.selectedFilter).toBe(mockFilter);
    });
  });

  it('should set filterDefinitionUsedInDropdown', async () => {
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );

    expect(result.current.filterDefinitionUsedInDropdown).toBeNull();

    act(() => {
      result.current.setFilterDefinitionUsedInDropdown(filterDefinitions[0]);
    });

    await waitFor(() => {
      expect(result.current.filterDefinitionUsedInDropdown).toBe(
        filterDefinitions[0],
      );
    });
  });

  it('should set objectFilterDropdownSearchInput', async () => {
    const mockResult = 'value';
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );

    expect(result.current.objectFilterDropdownSearchInput).toBe('');

    act(() => {
      result.current.setObjectFilterDropdownSearchInput(mockResult);
    });

    await waitFor(() => {
      expect(result.current.objectFilterDropdownSearchInput).toBe(mockResult);
    });
  });

  it('should set objectFilterDropdownSelectedEntityId', async () => {
    const mockResult = 'value';
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );

    expect(result.current.objectFilterDropdownSelectedEntityId).toBeNull();

    act(() => {
      result.current.setObjectFilterDropdownSelectedEntityId(mockResult);
    });

    await waitFor(() => {
      expect(result.current.objectFilterDropdownSelectedEntityId).toBe(
        mockResult,
      );
    });
  });

  it('should set objectFilterDropdownSelectedRecordIds', async () => {
    const mockResult = ['id-0', 'id-1', 'id-2'];
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );

    expect(result.current.objectFilterDropdownSelectedRecordIds).toHaveLength(
      0,
    );

    act(() => {
      result.current.setObjectFilterDropdownSelectedRecordIds(mockResult);
    });

    await waitFor(() => {
      expect(
        result.current.objectFilterDropdownSelectedRecordIds,
      ).toStrictEqual(mockResult);
    });
  });

  it('should set isObjectFilterDropdownOperandSelectUnfolded', async () => {
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );

    expect(result.current.isObjectFilterDropdownOperandSelectUnfolded).toBe(
      false,
    );

    act(() => {
      result.current.setIsObjectFilterDropdownOperandSelectUnfolded(true);
    });

    await waitFor(() => {
      expect(result.current.isObjectFilterDropdownOperandSelectUnfolded).toBe(
        true,
      );
    });
  });

  it('should set isObjectFilterDropdownUnfolded', async () => {
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );

    expect(result.current.isObjectFilterDropdownUnfolded).toBe(false);

    act(() => {
      result.current.setIsObjectFilterDropdownUnfolded(true);
    });

    await waitFor(() => {
      expect(result.current.isObjectFilterDropdownUnfolded).toBe(true);
    });
  });

  it('should reset filter', async () => {
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );

    act(() => {
      result.current.selectFilter(mockFilter);
    });

    await waitFor(() => {
      expect(result.current.selectedFilter).toStrictEqual(mockFilter);
    });

    act(() => {
      result.current.resetFilter();
    });

    await waitFor(() => {
      expect(result.current.selectedFilter).toBeUndefined();
    });
  });

  it('should call onFilterSelect when a filter option is set', async () => {
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );
    const onFilterSelectMock = jest.fn();

    expect(result.current.onFilterSelect).toBeUndefined();

    act(() => {
      result.current.setOnFilterSelect(onFilterSelectMock);
      result.current.selectFilter(mockFilter);
    });

    await waitFor(() => {
      expect(onFilterSelectMock).toBeDefined();
      expect(onFilterSelectMock).toHaveBeenCalled();
    });
  });

  it('should handle scopeId undefined on initial values', () => {
    console.error = jest.fn();

    const renderFunction = () => {
      renderHook(() => useFilterDropdown(), renderHookConfig);
    };

    expect(renderFunction).toThrow(Error);
    expect(renderFunction).toThrow(
      'Scope id is not provided and cannot be found in context.',
    );
  });

  it('should scopeId have been defined on initial values', () => {
    const { result } = renderHook(
      () => useFilterDropdown({ filterDropdownId }),
      renderHookConfig,
    );

    expect(result.current.scopeId).toBeDefined();
  });
});
