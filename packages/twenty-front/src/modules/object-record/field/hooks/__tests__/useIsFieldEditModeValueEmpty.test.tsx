import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { phoneFieldDefinition } from '@/object-record/field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { useIsFieldEditModeValueEmpty } from '@/object-record/field/hooks/useIsFieldEditModeValueEmpty';
import { entityFieldsEditModeValueFamilyState } from '@/object-record/field/states/entityFieldsEditModeValueFamilyState';

const entityId = 'entityId';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <FieldContext.Provider
    value={{
      fieldDefinition: phoneFieldDefinition,
      entityId,
      hotkeyScope: 'hotkeyScope',
      isLabelIdentifier: false,
    }}
  >
    <RecoilRoot>{children}</RecoilRoot>
  </FieldContext.Provider>
);

describe('useIsFieldEditModeValueEmpty', () => {
  it('should work as expected', () => {
    const { result } = renderHook(
      () => {
        const setFieldEditModeValue = useSetRecoilState(
          entityFieldsEditModeValueFamilyState(entityId),
        );
        return {
          setFieldEditModeValue,
          isFieldEditModeValueEmpty: useIsFieldEditModeValueEmpty(),
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isFieldEditModeValueEmpty).toBe(true);

    act(() => {
      result.current.setFieldEditModeValue({
        phone: '+1 233223',
      });
    });

    expect(result.current.isFieldEditModeValueEmpty).toBe(false);
  });
});
