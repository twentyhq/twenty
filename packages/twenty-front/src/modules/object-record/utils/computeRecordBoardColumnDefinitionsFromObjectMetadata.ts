import { IconEyeOff, IconPlus, IconSettings } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const computeRecordBoardColumnDefinitionsFromObjectMetadata = (
  objectMetadataItem: ObjectMetadataItem,
  kanbanFieldMetadataId: string,
  navigateToSelectSettings: () => void,
  createEmptyObjectWithStage: () => void,
): RecordBoardColumnDefinition[] => {
  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) =>
      field.id === kanbanFieldMetadataId &&
      field.type === FieldMetadataType.Select,
  );

  if (!selectFieldMetadataItem) {
    return [];
  }

  if (!selectFieldMetadataItem.options) {
    throw new Error(
      `Select Field ${objectMetadataItem.nameSingular} has no options`,
    );
  }

  return selectFieldMetadataItem.options.map((selectOption) => ({
    id: selectOption.id,
    title: selectOption.label,
    value: selectOption.value,
    color: selectOption.color,
    position: selectOption.position,
    actions: [
      {
        id: 'edit',
        label: 'Edit',
        icon: IconSettings,
        position: 0,
        callback: navigateToSelectSettings,
      },
      {
        id: 'hide',
        label: 'Hide',
        icon: IconEyeOff,
        position: 0,
        callback: navigateToSelectSettings,
      },
      {
        id: 'add',
        label: 'Add record',
        icon: IconPlus,
        position: 0,
        callback: createEmptyObjectWithStage,
      },
    ],
  }));
};
