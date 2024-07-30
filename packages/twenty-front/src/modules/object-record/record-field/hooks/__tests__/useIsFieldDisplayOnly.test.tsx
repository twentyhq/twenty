import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import {
  createdByFieldDefinition,
  phoneFieldDefinition,
} from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldDisplayOnly } from '@/object-record/record-field/hooks/useIsFieldDisplayOnly';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

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

const CreatedByWrapper = getWrapper(createdByFieldDefinition);
const PhoneWrapper = getWrapper(phoneFieldDefinition);

describe('useIsFieldDisplayOnly', () => {
  it('should return true', () => {
    const { result } = renderHook(() => useIsFieldDisplayOnly(), {
      wrapper: CreatedByWrapper,
    });

    expect(result.current).toBe(true);
  });

  it('should return false', () => {
    const { result } = renderHook(() => useIsFieldDisplayOnly(), {
      wrapper: PhoneWrapper,
    });

    expect(result.current).toBe(false);
  });
});
