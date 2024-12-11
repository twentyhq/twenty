import { Decorator } from '@storybook/react';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableContextProvider } from '@/object-record/record-table/contexts/RecordTableContext';
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
    <RecordTableContextProvider
      value={{
        objectNameSingular: personObjectMetadataItem.nameSingular,
        objectMetadataItem: personObjectMetadataItem,
        recordTableId: 'persons',
        viewBarId: 'view-bar',
        visibleTableColumns: [],
      }}
    >
      <RecordTableBodyContextProvider
        value={{
          onCellMouseEnter: () => {},
          onCloseTableCell: () => {},
          onOpenTableCell: () => {},
          onActionMenuDropdownOpened: () => {},
          onMoveFocus: () => {},
          onMoveSoftFocusToCell: () => {},
          onUpsertRecord: () => {},
        }}
      >
        <Story />
      </RecordTableBodyContextProvider>
    </RecordTableContextProvider>
  );
};
