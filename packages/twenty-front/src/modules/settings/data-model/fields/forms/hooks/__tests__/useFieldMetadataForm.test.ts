import { act, renderHook } from '@testing-library/react';

import { FieldMetadataType } from '~/generated/graphql';

import { useFieldMetadataForm } from '../useFieldMetadataForm';

describe('useFieldMetadataForm', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFieldMetadataForm());

    expect(result.current.isInitialized).toBe(false);

    act(() => {
      result.current.initForm({});
    });

    expect(result.current.isInitialized).toBe(true);
    expect(result.current.formValues).toEqual({
      type: 'TEXT',
      currency: { currencyCode: 'USD' },
      relation: {
        type: 'ONE_TO_MANY',
        objectMetadataId: '',
        field: { label: '' },
      },
      defaultValue: null,
      select: [
        { color: 'green', label: 'Option 1', value: expect.any(String) },
      ],
      multiSelect: [
        { color: 'green', label: 'Option 1', value: expect.any(String) },
      ],
    });
  });

  it('should handle form changes', () => {
    const { result } = renderHook(() => useFieldMetadataForm());

    act(() => {
      result.current.initForm({});
    });

    expect(result.current.hasFieldFormChanged).toBe(false);
    expect(result.current.hasRelationFormChanged).toBe(false);
    expect(result.current.hasSelectFormChanged).toBe(false);

    act(() => {
      result.current.handleFormChange({ type: FieldMetadataType.Number });
    });

    expect(result.current.hasFieldFormChanged).toBe(true);
    expect(result.current.hasRelationFormChanged).toBe(false);
    expect(result.current.hasSelectFormChanged).toBe(false);
  });
});
