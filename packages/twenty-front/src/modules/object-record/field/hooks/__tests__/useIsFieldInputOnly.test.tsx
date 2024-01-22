import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/field/hooks/useIsFieldInputOnly';
import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import {
  FieldMetadata,
  FieldPhoneMetadata,
  FieldRatingMetadata,
} from '@/object-record/field/types/FieldMetadata';

const fieldMetadataId = 'fieldMetadataId';
const entityId = 'entityId';

const ratingfieldDefinition: FieldDefinition<FieldRatingMetadata> = {
  fieldMetadataId,
  label: 'Rating',
  iconName: 'iconName',
  type: 'RATING',
  metadata: {
    fieldName: 'rating',
  },
};

const textFieldDefinition: FieldDefinition<FieldPhoneMetadata> = {
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
const TextWrapper = getWrapper(textFieldDefinition);

describe('useIsFieldInputOnly', () => {
  it('should return true', () => {
    const { result } = renderHook(() => useIsFieldInputOnly(), {
      wrapper: RatingWrapper,
    });

    expect(result.current).toBe(true);
  });

  it('should return false', () => {
    const { result } = renderHook(() => useIsFieldInputOnly(), {
      wrapper: TextWrapper,
    });

    expect(result.current).toBe(false);
  });
});
