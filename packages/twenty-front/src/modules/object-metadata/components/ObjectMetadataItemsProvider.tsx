import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  useFindManyObjectMetadataItems();

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      {objectMetadataItems.length < 1 && currentWorkspace ? (
        <></>
      ) : (
        <>
          <ObjectMetadataItemsRelationPickerEffect />
          <RelationPickerScope relationPickerScopeId="relation-picker">
            {children}
          </RelationPickerScope>
        </>
      )}
    </>
  );
};
