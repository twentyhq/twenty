import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import {
  phoneFieldDefinition,
  ratingfieldDefinition,
} from '@/object-record/field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/field/hooks/useIsFieldInputOnly';
import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';

const entityId = 'entityId';

const getWrapper =
  (fieldDefinition: FieldDefinition<FieldMetadata>) =>
  ({ children }: { children: ReactNode }) => (
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

const RatingWrapper = getWrapper(ratingfieldDefinition);
const PhoneWrapper = getWrapper(phoneFieldDefinition);

describe('useIsFieldInputOnly', () => {
  it('should return true', () => {
    const { result } = renderHook(() => useIsFieldInputOnly(), {
      wrapper: RatingWrapper,
    });

    expect(result.current).toBe(true);
  });

  it('should return false', () => {
    const { result } = renderHook(() => useIsFieldInputOnly(), {
      wrapper: PhoneWrapper,
    });

    expect(result.current).toBe(false);
  });
});
