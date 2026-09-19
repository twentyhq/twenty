import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { act, renderHook } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { type ReactNode } from 'react';

const RECORD_TABLE_ID = 'record-table-id';

const makeRecordField = (name: string, position: number): RecordField => ({
  id: `record-field-${name}`,
  fieldMetadataItemId: `field-metadata-${name}`,
  position,
  isVisible: true,
  size: 100,
});

const labelIdentifier = makeRecordField('name', 0);
const domain = makeRecordField('domain', 1);
const owner = makeRecordField('owner', 2);
const address = makeRecordField('address', 3);

const renderReorderHook = () => {
  const store = createStore();
  const currentRecordFieldsAtom = currentRecordFieldsComponentState.atomFamily({
    instanceId: RECORD_TABLE_ID,
  });

  store.set(currentRecordFieldsAtom, [labelIdentifier, domain, owner, address]);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  const { result } = renderHook(
    () => useReorderVisibleRecordFields(RECORD_TABLE_ID),
    { wrapper },
  );

  const getPositionOf = (recordField: RecordField) =>
    store.get(currentRecordFieldsAtom).find(({ id }) => id === recordField.id)
      ?.position;

  return { result, getPositionOf };
};

describe('useReorderVisibleRecordFields', () => {
  it('moves a field after the last field when dropped on it', () => {
    const { result, getPositionOf } = renderReorderHook();

    act(() => {
      result.current.reorderVisibleRecordFields({
        recordFieldToMove: domain,
        targetRecordField: address,
      });
    });

    expect(getPositionOf(domain)).toBeGreaterThan(address.position);
  });

  it('moves a field before the first draggable field when dropped on it', () => {
    const { result, getPositionOf } = renderReorderHook();

    act(() => {
      result.current.reorderVisibleRecordFields({
        recordFieldToMove: address,
        targetRecordField: domain,
      });
    });

    const newPosition = getPositionOf(address);

    expect(newPosition).toBeGreaterThan(labelIdentifier.position);
    expect(newPosition).toBeLessThan(domain.position);
  });

  it('moves a field between its new neighbours when dropped in the middle', () => {
    const { result, getPositionOf } = renderReorderHook();

    act(() => {
      result.current.reorderVisibleRecordFields({
        recordFieldToMove: domain,
        targetRecordField: owner,
      });
    });

    const newPosition = getPositionOf(domain);

    expect(newPosition).toBeGreaterThan(owner.position);
    expect(newPosition).toBeLessThan(address.position);
  });

  it('returns the moved field with its new position', () => {
    const { result } = renderReorderHook();

    let updatedRecordField: RecordField | undefined;

    act(() => {
      updatedRecordField = result.current.reorderVisibleRecordFields({
        recordFieldToMove: domain,
        targetRecordField: address,
      });
    });

    expect(updatedRecordField?.id).toBe(domain.id);
    expect(updatedRecordField?.position).toBeGreaterThan(address.position);
  });
});
