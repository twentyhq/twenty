import { useVariableDropdown } from '@/workflow/workflow-variables/hooks/useVariableDropdown';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { act, renderHook } from '@testing-library/react';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));
jest.mock(
  '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation',
  () => ({
    useSidePanelWorkflowNavigation: () => ({
      openWorkflowEditStepInSidePanel: jest.fn(),
    }),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => undefined,
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => jest.fn(),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: () => jest.fn(),
}));

const STEP: StepOutputSchemaV2 = {
  id: 'code',
  name: 'Run code',
  type: 'CODE',
  outputSchema: {
    result: {
      isLeaf: false,
      type: 'object',
      label: 'Result',
      value: {
        employees: {
          isLeaf: true,
          label: 'Employees',
          type: 'number',
          value: 5,
        },
      },
    },
  },
};

describe('useVariableDropdown search', () => {
  it('finds and selects a nested value from the single-step picker', () => {
    const onSelect = jest.fn();
    const { result } = renderHook(() =>
      useVariableDropdown({ step: STEP, onSelect, onBack: jest.fn() }),
    );

    act(() => result.current.setSearchInputValue(' EMPLOYEES '));
    expect(result.current.searchResults).toEqual([
      expect.objectContaining({ path: ['result', 'employees'] }),
    ]);
    act(() =>
      result.current.handleSelectSearchResult(result.current.searchResults[0]),
    );
    expect(onSelect).toHaveBeenCalledWith('{{code.result.employees}}', false);
  });

  it('opens a matching container and clears search when navigating back', () => {
    const { result } = renderHook(() =>
      useVariableDropdown({
        step: STEP,
        onSelect: jest.fn(),
        onBack: jest.fn(),
      }),
    );

    act(() => result.current.setSearchInputValue('result'));
    act(() =>
      result.current.handleSelectSearchResult(result.current.searchResults[0]),
    );
    expect(result.current.currentPath).toEqual(['result']);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.options.map(([key]) => key)).toEqual(['employees']);

    act(() => result.current.setSearchInputValue('employees'));
    act(() => result.current.goBack());
    expect(result.current.currentPath).toEqual([]);
    expect(result.current.searchInputValue).toBe('');
  });

  it('preserves whole-record selection for condition inputs', () => {
    const step: StepOutputSchemaV2 = {
      id: 'trigger',
      name: 'Record created',
      type: 'DATABASE_EVENT',
      outputSchema: {
        _outputSchemaType: 'RECORD',
        object: { label: 'Company', objectMetadataId: 'company' },
        fields: {},
      },
    };
    const onSelect = jest.fn();
    const { result } = renderHook(() =>
      useVariableDropdown({
        step,
        onSelect,
        onBack: jest.fn(),
        shouldDisplayRecordObjects: true,
        shouldDisplaySpecialItems: false,
      }),
    );
    act(() => result.current.setSearchInputValue('Company'));
    act(() =>
      result.current.handleSelectSearchResult(result.current.searchResults[0]),
    );
    expect(onSelect).toHaveBeenCalledWith('{{trigger.id}}', true);
  });
});
