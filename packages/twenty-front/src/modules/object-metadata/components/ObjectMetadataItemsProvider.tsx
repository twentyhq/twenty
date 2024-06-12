import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { PreComputedChipGeneratorsContext } from '@/object-metadata/context/PreComputedChipGeneratorsContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';
import { getRecordChipGeneratorPerObjectPerField } from '@/object-record/utils/getRecordChipGeneratorPerObjectPerField';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const shouldDisplayChildren = objectMetadataItems.length > 0;

  const chipGeneratorPerObjectPerField = useMemo(() => {
    return getRecordChipGeneratorPerObjectPerField(objectMetadataItems);
  }, [objectMetadataItems]);

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      {shouldDisplayChildren ? (
        <PreComputedChipGeneratorsContext.Provider
          value={{
            chipGeneratorPerObjectPerField,
          }}
        >
          <RelationPickerScope relationPickerScopeId="relation-picker">
            {children}
          </RelationPickerScope>
        </PreComputedChipGeneratorsContext.Provider>
      ) : (
        <UserOrMetadataLoader />
      )}
    </>
  );
};
