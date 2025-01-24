import { Decorator } from '@storybook/react';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
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
    <RecordIndexContextProvider
      value={{
        indexIdentifierUrl: () => '',
        onIndexRecordsLoaded: () => {},
        objectNamePlural: personObjectMetadataItem.namePlural,
        objectNameSingular: personObjectMetadataItem.nameSingular,
        objectMetadataItem: personObjectMetadataItem,
        recordIndexId: 'record-index',
      }}
    >
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
    </RecordIndexContextProvider>
  );
};
