import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useSyncStepFilterStateFromDefaultValue } from '@/workflow/workflow-steps/filters/hooks/useSyncStepFilterStateFromDefaultValue';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFiltersComponentInstanceContext';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { type StepFilter, ViewFilterOperand } from 'twenty-shared/types';

const buildStepFilter = (value: string): StepFilter => ({
  id: 'filter',
  type: 'NUMBER',
  stepOutputKey: 'employees',
  operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  value,
  stepFilterGroupId: 'group',
  compositeFieldSubFieldName: undefined,
});

const buildSavedStepFilter = (value: string): StepFilter => {
  const { compositeFieldSubFieldName: _, ...savedStepFilter } =
    buildStepFilter(value);

  return savedStepFilter;
};

const renderSyncHook = (instanceId: string) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <StepFiltersComponentInstanceContext.Provider value={{ instanceId }}>
      {children}
    </StepFiltersComponentInstanceContext.Provider>
  );

  return renderHook(
    ({ defaultValue }: { defaultValue: StepFilter[] }) => {
      useSyncStepFilterStateFromDefaultValue({
        stepFilterSettingState: currentStepFiltersComponentState,
        defaultValue,
      });

      return useAtomComponentState(currentStepFiltersComponentState);
    },
    { wrapper, initialProps: { defaultValue: [buildSavedStepFilter('')] } },
  );
};

const typeKey = ({
  result,
  key,
}: {
  result: ReturnType<typeof renderSyncHook>['result'];
  key: string;
}) => {
  act(() => {
    result.current[1]((stepFilters) => [
      buildStepFilter(`${stepFilters[0].value}${key}`),
    ]);
  });
};

describe('useSyncStepFilterStateFromDefaultValue', () => {
  it('keeps the latest typed value when older save responses land', () => {
    const { result, rerender } = renderSyncHook('stale-echo');

    typeKey({ result, key: '1' });
    typeKey({ result, key: '0' });
    rerender({ defaultValue: [buildSavedStepFilter('1')] });
    typeKey({ result, key: '0' });
    rerender({ defaultValue: [buildSavedStepFilter('10')] });
    typeKey({ result, key: '0' });
    rerender({ defaultValue: [buildSavedStepFilter('100')] });

    expect(result.current[0][0].value).toBe('1000');
  });

  it('applies a value this editor never held', () => {
    const { result, rerender } = renderSyncHook('external-change');

    typeKey({ result, key: '1' });
    rerender({ defaultValue: [buildSavedStepFilter('1')] });
    rerender({ defaultValue: [buildSavedStepFilter('42')] });

    expect(result.current[0][0].value).toBe('42');
  });

  it('seeds the editor on mount even if it already held that value', () => {
    const { result, unmount } = renderSyncHook('remount');

    typeKey({ result, key: '7' });
    unmount();

    const { result: remountedResult, rerender } = renderSyncHook('remount');

    expect(remountedResult.current[0][0].value).toBe('');

    rerender({ defaultValue: [buildSavedStepFilter('7')] });

    expect(remountedResult.current[0][0].value).toBe('7');
  });
});
