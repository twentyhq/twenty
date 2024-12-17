import React from 'react';
import { useRecoilValue } from 'recoil';

import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
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
            value={{ instanceId: 'record-picker' }}
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
