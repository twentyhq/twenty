import { isDefined } from 'twenty-shared/utils';

type FieldMetadataLayoutOrderItem = {
  id: string;
  position: number | null;
};

type FieldMetadataLayoutPositionUpdate = {
  fieldMetadataId: string;
  position: number;
};

export const computeFieldMetadataLayoutPositionUpdates = ({
  orderedFieldMetadataItems,
  movedFieldMetadataId,
  precedingFieldMetadataId,
}: {
  orderedFieldMetadataItems: FieldMetadataLayoutOrderItem[];
  movedFieldMetadataId: string;
  precedingFieldMetadataId: string | null;
}): FieldMetadataLayoutPositionUpdate[] => {
  const movedFieldMetadataItem = orderedFieldMetadataItems.find(
    (item) => item.id === movedFieldMetadataId,
  );

  if (!isDefined(movedFieldMetadataItem)) {
    return [];
  }

  const itemsWithoutMoved = orderedFieldMetadataItems.filter(
    (item) => item.id !== movedFieldMetadataId,
  );

  const positionedItems = itemsWithoutMoved.filter(
    (item): item is { id: string; position: number } =>
      isDefined(item.position),
  );

  if (precedingFieldMetadataId === null) {
    const firstPositionedItem = positionedItems[0];

    return [
      {
        fieldMetadataId: movedFieldMetadataId,
        position: isDefined(firstPositionedItem)
          ? firstPositionedItem.position - 1
          : 0,
      },
    ];
  }

  const precedingItem = itemsWithoutMoved.find(
    (item) => item.id === precedingFieldMetadataId,
  );

  if (!isDefined(precedingItem)) {
    return [];
  }

  const lastPositionedItem = positionedItems[positionedItems.length - 1];

  if (!isDefined(precedingItem.position)) {
    return [
      {
        fieldMetadataId: movedFieldMetadataId,
        position: isDefined(lastPositionedItem)
          ? lastPositionedItem.position + 1
          : 0,
      },
    ];
  }

  const precedingPositionedIndex = positionedItems.findIndex(
    (item) => item.id === precedingFieldMetadataId,
  );
  const nextPositionedItem = positionedItems[precedingPositionedIndex + 1];

  if (!isDefined(nextPositionedItem)) {
    return [
      {
        fieldMetadataId: movedFieldMetadataId,
        position: precedingItem.position + 1,
      },
    ];
  }

  if (precedingItem.position < nextPositionedItem.position) {
    return [
      {
        fieldMetadataId: movedFieldMetadataId,
        position: (precedingItem.position + nextPositionedItem.position) / 2,
      },
    ];
  }

  const reorderedPositionedItems = [
    ...positionedItems.slice(0, precedingPositionedIndex + 1),
    { id: movedFieldMetadataId, position: movedFieldMetadataItem.position },
    ...positionedItems.slice(precedingPositionedIndex + 1),
  ];

  return reorderedPositionedItems
    .map((item, index) => ({ item, index }))
    .filter(({ item, index }) => item.position !== index)
    .map(({ item, index }) => ({
      fieldMetadataId: item.id,
      position: index,
    }));
};
