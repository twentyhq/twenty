import { renderHook } from '@testing-library/react';

import { phonesFieldDefinition } from '@/object-record/record-field/__mocks__/fieldDefinitions';

import { useIsFieldValueReadOnly } from '../useIsFieldValueReadOnly';

describe('useIsFieldValueReadOnly', () => {
  it('should return true if the field is read only', () => {
    const { result } = renderHook(() =>
      useIsFieldValueReadOnly({
        fieldDefinition: phonesFieldDefinition,
        isRecordReadOnly: false,
      }),
    );

    expect(result.current).toBe(false);
  });

  it('should return true if the record is read only', () => {
    const { result } = renderHook(() =>
      useIsFieldValueReadOnly({
        fieldDefinition: phonesFieldDefinition,
        isRecordReadOnly: true,
      }),
    );

    expect(result.current).toBe(true);
  });
});
