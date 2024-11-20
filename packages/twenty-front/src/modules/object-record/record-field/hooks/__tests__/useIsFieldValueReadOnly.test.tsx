import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import {
  actorFieldDefinition,
  phonesFieldDefinition,
} from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { useIsFieldValueReadOnly } from '../useIsFieldValueReadOnly';

const recordId = 'recordId';

const getWrapper =
  (fieldDefinition: FieldDefinition<FieldMetadata>) =>
  ({ children }: { children: ReactNode }) => (
    <FieldContext.Provider
      value={{
        fieldDefinition,
        recordId,
        hotkeyScope: 'hotkeyScope',
        isLabelIdentifier: false,
      }}
    >
      <RecoilRoot>{children}</RecoilRoot>
    </FieldContext.Provider>
  );

const ActorWrapper = getWrapper(actorFieldDefinition);
const PhoneWrapper = getWrapper(phonesFieldDefinition);

describe('useIsFieldValueReadOnly', () => {
  it('should return true', () => {
    const { result } = renderHook(() => useIsFieldValueReadOnly(), {
      wrapper: ActorWrapper,
    });

    expect(result.current).toBe(true);
  });

  it('should return false', () => {
    const { result } = renderHook(() => useIsFieldValueReadOnly(), {
      wrapper: PhoneWrapper,
    });

    expect(result.current).toBe(false);
  });
});
