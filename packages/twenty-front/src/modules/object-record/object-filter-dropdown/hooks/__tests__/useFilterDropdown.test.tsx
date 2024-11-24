import { expect } from '@storybook/test';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilState } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { useFilterDropdownStates } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdownStates';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { MockedProvider } from '@apollo/client/testing';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';

const filterDropdownId = 'filterDropdownId';
const renderHookConfig = {
  wrapper: ({ children }: any) => (
    <RecoilRoot>
      <MockedProvider mocks={[]} addTypename={false}>
        <JestObjectMetadataItemSetter>
          <ViewComponentInstanceContext.Provider value={{ instanceId: 'test' }}>
            {children}
          </ViewComponentInstanceContext.Provider>
        </JestObjectMetadataItemSetter>
      </MockedProvider>
    </RecoilRoot>
  ),
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
  id: 'id',
  definition: filterDefinitions[0],
  displayValue: '',
  fieldMetadataId: '',
  operand: ViewFilterOperand.Is,
  value: '',
};

describe('useFilterDropdown', () => {
  it('should set availableFilterDefinitions', async () => {
    const { result } = renderHook(() => {
      useFilterDropdown({ filterDropdownId });

      const [availableFilterDefinitions, setAvailableFilterDefinitions] =
        useRecoilComponentStateV2(
          availableFilterDefinitionsComponentState,
          filterDropdownId,
        );

      return { availableFilterDefinitions, setAvailableFilterDefinitions };
    }, renderHookConfig);

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
    const { result } = renderHook(() => {
      useFilterDropdown({ filterDropdownId });
      const { onFilterSelectState } = useFilterDropdownStates(filterDropdownId);

      const [onFilterSelect, setOnFilterSelect] =
        useRecoilState(onFilterSelectState);
      return { onFilterSelect, setOnFilterSelect };
    }, renderHookConfig);

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
    const { result } = renderHook(() => {
      useFilterDropdown({ filterDropdownId });
      const { selectedOperandInDropdownState } =
        useFilterDropdownStates(filterDropdownId);

      const [selectedOperandInDropdown, setSelectedOperandInDropdown] =
        useRecoilState(selectedOperandInDropdownState);
      return { selectedOperandInDropdown, setSelectedOperandInDropdown };
    }, renderHookConfig);

    const mockOperand = ViewFilterOperand.Contains;

    expect(result.current.selectedOperandInDropdown).toBeNull();

    act(() => {
      result.current.setSelectedOperandInDropdown(mockOperand);
    });

    expect(result.current.selectedOperandInDropdown).toBe(mockOperand);
  });

  it('should set selectedFilter', async () => {
    const { result } = renderHook(() => {
      useFilterDropdown({ filterDropdownId });
      const { selectedFilterState } = useFilterDropdownStates(filterDropdownId);

      const [selectedFilter, setSelectedFilter] =
        useRecoilState(selectedFilterState);
      return { selectedFilter, setSelectedFilter };
    }, renderHookConfig);

    expect(result.current.selectedFilter).toBeUndefined();

    act(() => {
      result.current.setSelectedFilter(mockFilter);
    });

    await waitFor(() => {
      expect(result.current.selectedFilter).toBe(mockFilter);
    });
  });

  it('should set filterDefinitionUsedInDropdown', async () => {
    const { result } = renderHook(() => {
      useFilterDropdown({ filterDropdownId });
      const { filterDefinitionUsedInDropdownState } =
        useFilterDropdownStates(filterDropdownId);

      const [
        filterDefinitionUsedInDropdown,
        setFilterDefinitionUsedInDropdown,
      ] = useRecoilState(filterDefinitionUsedInDropdownState);
      return {
        filterDefinitionUsedInDropdown,
        setFilterDefinitionUsedInDropdown,
      };
    }, renderHookConfig);

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
    const { result } = renderHook(() => {
      useFilterDropdown({ filterDropdownId });
      const { objectFilterDropdownSearchInputState } =
        useFilterDropdownStates(filterDropdownId);

      const [
        objectFilterDropdownSearchInput,
        setObjectFilterDropdownSearchInput,
      ] = useRecoilState(objectFilterDropdownSearchInputState);
      return {
        objectFilterDropdownSearchInput,
        setObjectFilterDropdownSearchInput,
      };
    }, renderHookConfig);

    expect(result.current.objectFilterDropdownSearchInput).toBe('');

    act(() => {
      result.current.setObjectFilterDropdownSearchInput(mockResult);
    });

    await waitFor(() => {
      expect(result.current.objectFilterDropdownSearchInput).toBe(mockResult);
    });
  });

  it('should set objectFilterDropdownSelectedRecordId', async () => {
    const mockResult = ['value'];
    const { result } = renderHook(() => {
      useFilterDropdown({ filterDropdownId });
      const { objectFilterDropdownSelectedRecordIdsState } =
        useFilterDropdownStates(filterDropdownId);

      const [
        objectFilterDropdownSelectedRecordIds,
        setObjectFilterDropdownSelectedRecordIds,
      ] = useRecoilState(objectFilterDropdownSelectedRecordIdsState);
      return {
        objectFilterDropdownSelectedRecordIds,
        setObjectFilterDropdownSelectedRecordIds,
      };
    }, renderHookConfig);

    expect(
      JSON.stringify(result.current.objectFilterDropdownSelectedRecordIds),
    ).toBe(JSON.stringify([]));

    act(() => {
      result.current.setObjectFilterDropdownSelectedRecordIds(mockResult);
    });

    await waitFor(() => {
      expect(result.current.objectFilterDropdownSelectedRecordIds).toBe(
        mockResult,
      );
    });
  });

  it('should set objectFilterDropdownSelectedRecordIds', async () => {
    const mockResult = ['id-0', 'id-1', 'id-2'];
    const { result } = renderHook(() => {
      useFilterDropdown({ filterDropdownId });
      const { objectFilterDropdownSelectedRecordIdsState } =
        useFilterDropdownStates(filterDropdownId);

      const [
        objectFilterDropdownSelectedRecordIds,
        setObjectFilterDropdownSelectedRecordIds,
      ] = useRecoilState(objectFilterDropdownSelectedRecordIdsState);
      return {
        objectFilterDropdownSelectedRecordIds,
        setObjectFilterDropdownSelectedRecordIds,
      };
    }, renderHookConfig);

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

  it('should reset filter', async () => {
    const { result } = renderHook(() => {
      const { resetFilter, selectFilter } = useFilterDropdown({
        filterDropdownId,
      });

      const { selectedFilterState } = useFilterDropdownStates(filterDropdownId);

      const [selectedFilter, setSelectedFilter] =
        useRecoilState(selectedFilterState);
      return { selectedFilter, setSelectedFilter, selectFilter, resetFilter };
    }, renderHookConfig);

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
    const { result } = renderHook(() => {
      const { selectFilter } = useFilterDropdown({ filterDropdownId });
      const { onFilterSelectState } = useFilterDropdownStates(filterDropdownId);

      const [onFilterSelect, setOnFilterSelect] =
        useRecoilState(onFilterSelectState);
      return { onFilterSelect, setOnFilterSelect, selectFilter };
    }, renderHookConfig);
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
    global.console.error = jest.fn();

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
