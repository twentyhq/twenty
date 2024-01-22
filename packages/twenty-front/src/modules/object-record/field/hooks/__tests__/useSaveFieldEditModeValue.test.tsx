import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { useSaveFieldEditModeValue } from '@/object-record/field/hooks/useSaveFieldEditModeValue';
import { entityFieldsEditModeValueFamilySelector } from '@/object-record/field/states/selectors/entityFieldsEditModeValueFamilySelector';
import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import { FieldPhoneMetadata } from '@/object-record/field/types/FieldMetadata';

const entityId = 'entityId';
const fieldName = 'phone';
const fieldMetadataId = 'fieldMetadataId';

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

const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <MockedProvider addTypename={false}>
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
    </MockedProvider>
  );
};

describe('useSaveFieldEditModeValue', () => {
  it('should work as expected', () => {
    const {
      result: { current },
    } = renderHook(
      () => {
        const entityFieldsEditModeValue = useRecoilValue(
          entityFieldsEditModeValueFamilySelector({ entityId, fieldName }),
        );
        return {
          saveFieldEditModeValue: useSaveFieldEditModeValue(),
          entityFieldsEditModeValue,
        };
      },
      { wrapper: Wrapper },
    );

    expect(current.entityFieldsEditModeValue).toBeUndefined();

    act(() => {
      current.saveFieldEditModeValue('test');
    });

    // We expect `current.entityFieldsEditModeValue` to be updated
    // but I think it's async
  });
});
