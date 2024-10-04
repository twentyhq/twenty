import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';
import { IconPencil } from 'twenty-ui';

import {
  phonesFieldDefinition,
  relationFieldDefinition,
} from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
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
