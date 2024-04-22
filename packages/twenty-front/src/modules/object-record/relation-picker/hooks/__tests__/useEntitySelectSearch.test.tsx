import { ChangeEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
import { useEntitySelectSearch } from '@/object-record/relation-picker/hooks/useEntitySelectSearch';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';

const scopeId = 'scopeId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RelationPickerScopeInternalContext.Provider value={{ scopeId }}>
    <RecoilRoot>{children}</RecoilRoot>
  </RelationPickerScopeInternalContext.Provider>
);

describe('useEntitySelectSearch', () => {
  it('should update searchFilter after change event', async () => {
    const { result } = renderHook(
      () => {
        const entitySelectSearchHook = useEntitySelectSearch({
          relationPickerScopeId: 'relation-picker',
        });
        const relationPickerScopedStatesHook = useRelationPickerScopedStates({
          relationPickerScopedId: 'relation-picker',
        });
        const internallyStoredFilter = useRecoilValue(
          relationPickerScopedStatesHook.relationPickerSearchFilterState,
        );
        return { entitySelectSearchHook, internallyStoredFilter };
      },
      {
        wrapper: Wrapper,
      },
    );

    const filter = 'value';

    act(() => {
      result.current.entitySelectSearchHook.handleSearchFilterChange({
        currentTarget: { value: filter },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.internallyStoredFilter).toBe(filter);
  });
});
