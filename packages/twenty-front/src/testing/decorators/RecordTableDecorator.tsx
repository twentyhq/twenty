import { Decorator } from '@storybook/react';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { isDefined } from 'twenty-ui';

export const RecordTableDecorator: Decorator = (Story) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const personObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.nameSingular === 'person',
  );

  if (!isDefined(personObjectMetadataItem)) {
    return <Story />;
  }

  return (
    <RecordTableContext.Provider
      value={{
        objectNameSingular: personObjectMetadataItem?.nameSingular,
        objectMetadataItem: personObjectMetadataItem,
        onCellMouseEnter: () => {},
        onCloseTableCell: () => {},
        onOpenTableCell: () => {},
        onActionMenuDropdownOpened: () => {},
        onMoveFocus: () => {},
        onMoveSoftFocusToCell: () => {},
        onUpsertRecord: () => {},
        recordTableId: 'persons',
        viewBarId: 'view-bar',
        visibleTableColumns: [],
      }}
    >
      <Story />
    </RecordTableContext.Provider>
  );
};
