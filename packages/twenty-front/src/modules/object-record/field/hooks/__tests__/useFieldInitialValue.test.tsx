import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { entityFieldInitialValueFamilyState } from '@/object-record/field/states/entityFieldInitialValueFamilyState';

import { useFieldInitialValue } from '../useFieldInitialValue';

const fieldMetadataId = 'fieldMetadataId';
const entityId = 'entityId';

const wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <FieldContext.Provider
      value={{
        fieldDefinition: {
          fieldMetadataId,
          label: 'User Name',
          iconName: 'User',
          type: 'TEXT',
          metadata: { placeHolder: 'John Doe', fieldName: 'userName' },
        },
        entityId,
        hotkeyScope: 'hotkeyScope',
        isLabelIdentifier: false,
      }}
    >
      {children}
    </FieldContext.Provider>
  </RecoilRoot>
);

describe('useFieldInitialValue', () => {
  it('should work as expected', () => {
    const { result } = renderHook(
      () => {
        const setFieldInitialValue = useSetRecoilState(
          entityFieldInitialValueFamilyState({
            fieldMetadataId,
            entityId,
          }),
        );

        return {
          setFieldInitialValue,
          fieldInitialValue: useFieldInitialValue(),
        };
      },
      {
        wrapper,
      },
    );

    expect(result.current.fieldInitialValue).toBeUndefined();

    const initialValue = { isEmpty: false, value: 'Sheldon Cooper' };

    act(() => {
      result.current.setFieldInitialValue(initialValue);
    });

    expect(result.current.fieldInitialValue).toEqual(initialValue);
  });
});
