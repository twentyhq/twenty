import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import {
  phonesFieldDefinition,
  ratingFieldDefinition,
} from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

const recordId = 'recordId';

const getWrapper =
  (fieldDefinition: FieldDefinition<FieldMetadata>) =>
  ({ children }: { children: ReactNode }) => (
    <FieldContext.Provider
      value={{
        fieldDefinition,
        recordId,
        isLabelIdentifier: false,
        isRecordFieldReadOnly: false,
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
