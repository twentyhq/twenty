import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { findById } from 'twenty-shared/utils';

import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { useMoveRecordField } from '@/object-record/record-field/hooks/useMoveRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const INSTANCE_ID = 'instanceId';

const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const eligibleFieldMetadataItems = objectMetadataItem.fields.filter(
  (fieldMetadataItem) => {
    const isLabelIdentifier =
      fieldMetadataItem.id ===
      objectMetadataItem.labelIdentifierFieldMetadataId;

    const isReadable = objectMetadataItem.readableFields.some(
      findById(fieldMetadataItem.id),
    );

    const isActive =
      isLabelIdentifier ||
      isActiveFieldMetadataItem({
        objectNameSingular: objectMetadataItem.nameSingular,
        fieldMetadata: fieldMetadataItem,
      });

    return isReadable && isActive;
  },
);

const [firstField, secondField, thirdField, hiddenField] =
  eligibleFieldMetadataItems;

const buildRecordField = (
  fieldMetadataItemId: string,
  position: number,
  isVisible: boolean,
): RecordField => ({
  id: `view-field-${fieldMetadataItemId}`,
  fieldMetadataItemId,
  position,
  isVisible,
  size: 100,
});

const renderUseMoveRecordField = () => {
  const wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
    onInitializeJotaiStore: (store) => {
      store.set(
        currentRecordFieldsComponentState.atomFamily({
          instanceId: INSTANCE_ID,
        }),
        [
          buildRecordField(firstField.id, 0, true),
          buildRecordField(hiddenField.id, 1, false),
          buildRecordField(secondField.id, 2, true),
          buildRecordField(thirdField.id, 4, true),
        ],
      );
    },
  });

  return renderHook(
    () => {
      const { moveRecordField } = useMoveRecordField(INSTANCE_ID);
      const visibleFieldMetadataItemIds = useAtomComponentSelectorValue(
        visibleRecordFieldsComponentSelector,
      ).map((recordField) => recordField.fieldMetadataItemId);

      return { moveRecordField, visibleFieldMetadataItemIds };
    },
    { wrapper },
  );
};

describe('useMoveRecordField', () => {
  it('should move a visible field past an interleaved hidden column to the next visible field', async () => {
    const { result } = renderUseMoveRecordField();

    expect(result.current.visibleFieldMetadataItemIds).toEqual([
      firstField.id,
      secondField.id,
      thirdField.id,
    ]);

    await act(async () => {
      await result.current.moveRecordField({
        direction: 'after',
        fieldMetadataItemIdToMove: firstField.id,
      });
    });

    expect(result.current.visibleFieldMetadataItemIds).toEqual([
      secondField.id,
      firstField.id,
      thirdField.id,
    ]);
  });

  it('should not reorder when moving the last visible field further after', async () => {
    const { result } = renderUseMoveRecordField();

    await act(async () => {
      await result.current.moveRecordField({
        direction: 'after',
        fieldMetadataItemIdToMove: thirdField.id,
      });
    });

    expect(result.current.visibleFieldMetadataItemIds).toEqual([
      firstField.id,
      secondField.id,
      thirdField.id,
    ]);
  });

  it('should not reorder when moving the first visible field further before', async () => {
    const { result } = renderUseMoveRecordField();

    await act(async () => {
      await result.current.moveRecordField({
        direction: 'before',
        fieldMetadataItemIdToMove: firstField.id,
      });
    });

    expect(result.current.visibleFieldMetadataItemIds).toEqual([
      firstField.id,
      secondField.id,
      thirdField.id,
    ]);
  });
});
