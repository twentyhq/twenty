import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';
import { RecoilRoot } from 'recoil';

import { useRecordSelectSearch } from '@/object-record/record-picker/hooks/useRecordSelectSearch';
import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { recordPickerSearchFilterComponentState } from '@/object-record/record-picker/states/recordPickerSearchFilterComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

const instanceId = 'instanceId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecordPickerComponentInstanceContext.Provider value={{ instanceId }}>
    <RecoilRoot>{children}</RecoilRoot>
  </RecordPickerComponentInstanceContext.Provider>
);

describe('useRecordSelectSearch', () => {
  it('should update searchFilter after change event', async () => {
    const { result } = renderHook(
      () => {
        const recordSelectSearchHook = useRecordSelectSearch(instanceId);
        const internallyStoredFilter = useRecoilComponentValueV2(
          recordPickerSearchFilterComponentState,
          instanceId,
        );
        return { recordSelectSearchHook, internallyStoredFilter };
      },
      {
        wrapper: Wrapper,
      },
    );

    const filter = 'value';

    act(() => {
      result.current.recordSelectSearchHook.handleSearchFilterChange({
        currentTarget: { value: filter },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.internallyStoredFilter).toBe(filter);
  });
});
