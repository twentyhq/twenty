import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import {
  phonesFieldDefinition,
  relationFieldDefinition,
} from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useGetButtonIcon } from '@/object-record/record-field/ui/hooks/useGetButtonIcon';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { IconPencil } from 'twenty-ui/display';

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

const PhoneWrapper = getWrapper(phonesFieldDefinition);
const RelationWrapper = getWrapper(relationFieldDefinition);

describe('useGetButtonIcon', () => {
  it('should return undefined', () => {
    const { result } = renderHook(() => useGetButtonIcon());
    expect(result.current).toBeUndefined();
  });

  it('should return icon pencil', () => {
    const { result } = renderHook(() => useGetButtonIcon(), {
      wrapper: PhoneWrapper,
    });
    expect(result.current).toEqual(IconPencil);
  });

  it('should return iconPencil for relation field', () => {
    const { result } = renderHook(() => useGetButtonIcon(), {
      wrapper: RelationWrapper,
    });
    expect(result.current).toEqual(IconPencil);
  });
});
