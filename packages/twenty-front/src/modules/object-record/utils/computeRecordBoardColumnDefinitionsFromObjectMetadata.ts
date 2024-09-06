import { IconSettings } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  RecordBoardColumnDefinition,
  RecordBoardColumnDefinitionNoValue,
  RecordBoardColumnDefinitionType,
  RecordBoardColumnDefinitionValue,
} from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const computeRecordBoardColumnDefinitionsFromObjectMetadata = (
  objectMetadataItem: ObjectMetadataItem,
  kanbanFieldMetadataId: string,
  navigateToSelectSettings: () => void,
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

  const valueColumns = selectFieldMetadataItem.options.map(
    (selectOption) =>
      ({
        id: selectOption.id,
        type: RecordBoardColumnDefinitionType.Value,
        title: selectOption.label,
        value: selectOption.value,
        color: selectOption.color,
        position: selectOption.position,
        actions: [
          {
            id: 'edit',
            label: 'Edit from Settings',
            icon: IconSettings,
            position: 0,
            callback: navigateToSelectSettings,
          },
        ],
      }) satisfies RecordBoardColumnDefinitionValue,
  );

  const noValueColumn = {
    id: 'no-value',
    title: 'No Value',
    type: RecordBoardColumnDefinitionType.NoValue,
    value: null,
    actions: [],
    position:
      selectFieldMetadataItem.options
        .map((option) => option.position)
        .reduce((a, b) => Math.max(a, b), 0) + 1,
  } satisfies RecordBoardColumnDefinitionNoValue;

  if (selectFieldMetadataItem.isNullable === true) {
    return [...valueColumns, noValueColumn];
  }

  return valueColumns;
};
