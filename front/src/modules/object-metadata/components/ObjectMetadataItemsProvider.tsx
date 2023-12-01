import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RelationPickerScope } from '@/ui/input/components/internal/relation-picker/scopes/RelationPickerScope';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return objectMetadataItems.length < 1 && currentWorkspace ? (
    <>
      <ObjectMetadataItemsLoadEffect />
    </>
  ) : (
    <>
      <ObjectMetadataItemsRelationPickerEffect />
      <RelationPickerScope relationPickerScopeId="relation-picker">
        {children}
      </RelationPickerScope>
    </>
  );
};
