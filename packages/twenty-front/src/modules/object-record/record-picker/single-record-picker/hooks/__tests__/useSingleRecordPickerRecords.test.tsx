import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';
import { RecoilRoot } from 'recoil';

import { useSingleRecordPickerSearch } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerSearch';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

const instanceId = 'instanceId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <SingleRecordPickerComponentInstanceContext.Provider value={{ instanceId }}>
    <RecoilRoot>{children}</RecoilRoot>
  </SingleRecordPickerComponentInstanceContext.Provider>
);

describe('useSingleRecordPickerRecords', () => {
  it('should update searchFilter after change event', async () => {
    const { result } = renderHook(
      () => {
        const recordSelectSearchHook = useSingleRecordPickerSearch(instanceId);
        const internallyStoredFilter = useRecoilComponentValue(
          singleRecordPickerSearchFilterComponentState,
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
