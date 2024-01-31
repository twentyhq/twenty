import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      {(!currentWorkspace || !!objectMetadataItems.length) && (
        <RelationPickerScope relationPickerScopeId="relation-picker">
          {children}
        </RelationPickerScope>
      )}
    </>
  );
};
