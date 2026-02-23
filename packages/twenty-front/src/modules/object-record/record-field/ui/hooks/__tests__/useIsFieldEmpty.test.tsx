import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { phonesFieldDefinition } from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsFieldEmpty } from '@/object-record/record-field/ui/hooks/useIsFieldEmpty';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useSetFamilyRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetFamilyRecoilStateV2';

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
      <RecoilRoot>{children}</RecoilRoot>
    </FieldContext.Provider>
  </JotaiProvider>
);

describe('useIsFieldEmpty', () => {
  it('should work as expected', () => {
    const { result } = renderHook(
      () => {
        const setFieldState = useSetFamilyRecoilStateV2(
          recordStoreFamilyState,
          recordId,
        );
        return {
          setFieldState,
          isFieldEditModeValueEmpty: useIsFieldEmpty(),
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isFieldEditModeValueEmpty).toBe(true);

    act(() => {
      result.current.setFieldState({
        id: 'id',
        phone: '+1 233223',
        __typename: 'Person',
      });
    });

    // Todo: fix this test
    expect(result.current.isFieldEditModeValueEmpty).toBe(true);
  });
});
