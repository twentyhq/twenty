import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { useIsFieldEditModeValueEmpty } from '@/object-record/field/hooks/useIsFieldEditModeValueEmpty';
import { entityFieldsEditModeValueFamilyState } from '@/object-record/field/states/entityFieldsEditModeValueFamilyState';
import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import { FieldPhoneMetadata } from '@/object-record/field/types/FieldMetadata';

const fieldMetadataId = 'fieldMetadataId';
const entityId = 'entityId';

const fieldDefinition: FieldDefinition<FieldPhoneMetadata> = {
  fieldMetadataId,
  label: 'Contact',
  iconName: 'Phone',
  type: 'TEXT',
  metadata: {
    objectMetadataNameSingular: 'person',
    placeHolder: '(+256)-712-345-6789',
    fieldName: 'phone',
  },
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <FieldContext.Provider
    value={{
      fieldDefinition,
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
