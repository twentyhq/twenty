import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import {
  phonesFieldDefinition,
  ratingFieldDefinition,
} from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

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

const RatingWrapper = getWrapper(ratingFieldDefinition);
const PhoneWrapper = getWrapper(phonesFieldDefinition);

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
