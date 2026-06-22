import { act, fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { FieldWidgetTextEditor } from '@/page-layout/widgets/field/components/FieldWidgetTextEditor';
import { FieldMetadataType } from 'twenty-shared/types';

const mockUpdateOneRecord = jest.fn();

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: mockUpdateOneRecord,
  }),
}));

jest.mock('@/object-record/read-only/hooks/useIsRecordFieldReadOnly', () => ({
  useIsRecordFieldReadOnly: () => false,
}));

const RECORD_ID = 'record-id';
const FIELD_NAME = 'useCase';

const fieldMetadataItem = {
  id: 'field-metadata-id',
  label: 'Use case',
  name: FIELD_NAME,
  type: FieldMetadataType.TEXT,
} as FieldMetadataItem;

const objectMetadataItem = {
  id: 'object-metadata-id',
  nameSingular: 'opportunity',
  fields: [fieldMetadataItem],
  readableFields: [fieldMetadataItem],
  updatableFields: [fieldMetadataItem],
  labelIdentifierFieldMetadataId: fieldMetadataItem.id,
  indexMetadatas: [],
} as EnrichedObjectMetadataItem;

const createRecord = (fieldValue: string) => ({
  id: RECORD_ID,
  __typename: 'Opportunity',
  [FIELD_NAME]: fieldValue,
});

const setStoredFieldValue = (
  store: ReturnType<typeof createStore>,
  fieldValue: string,
) => {
  act(() => {
    store.set(recordStoreFamilyState.atomFamily(RECORD_ID), {
      ...store.get(recordStoreFamilyState.atomFamily(RECORD_ID)),
      [FIELD_NAME]: fieldValue,
    });
  });
};

const renderEditor = (initialFieldValue = 'Initial use case') => {
  const store = createStore();

  store.set(
    recordStoreFamilyState.atomFamily(RECORD_ID),
    createRecord(initialFieldValue),
  );

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

  render(
    <FieldWidgetTextEditor
      fieldMetadataItem={fieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={RECORD_ID}
    />,
    { wrapper: Wrapper },
  );

  return { store };
};

describe('FieldWidgetTextEditor', () => {
  beforeEach(() => {
    mockUpdateOneRecord.mockClear();
  });

  it('does not replace the focused textarea value when the record store changes externally', () => {
    const { store } = renderEditor('Initial use case');
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

    fireEvent.focus(textarea);
    fireEvent.change(textarea, {
      target: { value: 'Initial edited use case' },
    });

    setStoredFieldValue(store, 'Externally refreshed use case');

    expect(textarea.value).toBe('Initial edited use case');
  });

  it('flushes the final draft on blur even after a stale store rewrite while focused', () => {
    const { store } = renderEditor('Initial use case');
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

    fireEvent.focus(textarea);
    fireEvent.change(textarea, {
      target: { value: 'Final edited use case' },
    });
    setStoredFieldValue(store, 'Externally refreshed use case');
    fireEvent.blur(textarea);

    expect(mockUpdateOneRecord).toHaveBeenCalledTimes(1);
    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: 'opportunity',
      idToUpdate: RECORD_ID,
      updateOneRecordInput: {
        [FIELD_NAME]: 'Final edited use case',
      },
    });
    expect(
      store.get(recordStoreFamilyState.atomFamily(RECORD_ID))?.[FIELD_NAME],
    ).toBe('Final edited use case');
  });

  it('syncs external record store changes when the textarea is not focused', () => {
    const { store } = renderEditor('Initial use case');
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

    setStoredFieldValue(store, 'Externally refreshed use case');

    expect(textarea.value).toBe('Externally refreshed use case');
  });
});
