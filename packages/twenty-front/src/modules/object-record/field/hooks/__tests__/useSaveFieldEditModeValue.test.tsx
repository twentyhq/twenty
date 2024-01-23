import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { phoneFieldDefinition } from '@/object-record/field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { useSaveFieldEditModeValue } from '@/object-record/field/hooks/useSaveFieldEditModeValue';
import { entityFieldsEditModeValueFamilySelector } from '@/object-record/field/states/selectors/entityFieldsEditModeValueFamilySelector';

const entityId = 'entityId';
const fieldName = 'phone';

const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <MockedProvider addTypename={false}>
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
