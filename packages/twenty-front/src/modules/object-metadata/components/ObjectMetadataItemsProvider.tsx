import React from 'react';
import { useRecoilValue } from 'recoil';

import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RelationPickerHotkeyScope } from '@/object-record/record-picker/legacy/types/RelationPickerHotkeyScope';
import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const shouldDisplayChildren = objectMetadataItems.length > 0;

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      {shouldDisplayChildren ? (
        <PreComputedChipGeneratorsProvider>
          <RecordPickerComponentInstanceContext.Provider
            value={{ instanceId: RelationPickerHotkeyScope.RelationPicker }}
          >
            {children}
          </RecordPickerComponentInstanceContext.Provider>
        </PreComputedChipGeneratorsProvider>
      ) : (
        <UserOrMetadataLoader />
      )}
    </>
  );
};
