import { useRecoilValue } from 'recoil';

import { isWorkspaceSchemaCreatedState } from '@/auth/states/isWorkspaceSchemaCreated';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const isWorkspaceSchemaCreated = useRecoilValue(
    isWorkspaceSchemaCreatedState,
  );

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      {(!isWorkspaceSchemaCreated || !!objectMetadataItems.length) && (
        <RelationPickerScope relationPickerScopeId="relation-picker">
          {children}
        </RelationPickerScope>
      )}
    </>
  );
};
