import { act, renderHook } from '@testing-library/react';
import { type ChangeEvent } from 'react';

import { useSingleRecordPickerSearch } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerSearch';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const instanceId = 'instanceId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <SingleRecordPickerComponentInstanceContext.Provider value={{ instanceId }}>
    {children}
  </SingleRecordPickerComponentInstanceContext.Provider>
);

describe('useSingleRecordPickerRecords', () => {
  it('should update searchFilter after change event', async () => {
    const { result } = renderHook(
      () => {
        const recordSelectSearchHook = useSingleRecordPickerSearch(instanceId);
        const singleRecordPickerSearchFilter = useAtomComponentStateValue(
          singleRecordPickerSearchFilterComponentState,
          instanceId,
        );
        return { recordSelectSearchHook, singleRecordPickerSearchFilter };
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

    expect(result.current.singleRecordPickerSearchFilter).toBe(filter);
  });
});
