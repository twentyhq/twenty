import React from 'react';
import { useRecoilValue } from 'recoil';

import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';
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
        <RelationPickerScope relationPickerScopeId="relation-picker">
          {children}
        </RelationPickerScope>
      ) : (
        <UserOrMetadataLoader />
      )}
    </>
  );
};
