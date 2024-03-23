import React from 'react';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState.ts';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const shouldDisplayChildren =
    objectMetadataItems.length > 0 || !currentWorkspaceMember;

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      {shouldDisplayChildren && (
        <RelationPickerScope relationPickerScopeId="relation-picker">
          {children}
        </RelationPickerScope>
      )}
    </>
  );
};
