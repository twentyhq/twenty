import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { phonesFieldDefinition } from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsFieldEmpty } from '@/object-record/record-field/ui/hooks/useIsFieldEmpty';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

const recordId = 'recordId';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <FieldContext.Provider
      value={{
        fieldDefinition: phonesFieldDefinition,
        recordId,
        isLabelIdentifier: false,
        isRecordFieldReadOnly: false,
      }}
    >
      {children}
    </FieldContext.Provider>
  </JotaiProvider>
);

describe('useIsFieldEmpty', () => {
  it('should work as expected', () => {
    const { result } = renderHook(
      () => {
        const setRecordStore = useSetAtomFamilyState(
          recordStoreFamilyState,
          recordId,
        );
        return {
          setRecordStore,
          isFieldEditModeValueEmpty: useIsFieldEmpty(),
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isFieldEditModeValueEmpty).toBe(true);

    act(() => {
      result.current.setRecordStore({
        id: 'id',
        phone: '+1 233223',
        __typename: 'Person',
      });
    });

    // Todo: fix this test
    expect(result.current.isFieldEditModeValueEmpty).toBe(true);
  });
});
