import { useRecoilValue } from 'recoil';

import { isCurrentWorkspaceActiveSelector } from '@/auth/states/selectors/isCurrentWorkspaceActiveSelector';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const isCurrentWorkspaceActive = useRecoilValue(
    isCurrentWorkspaceActiveSelector,
  );

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      {(!isCurrentWorkspaceActive || !!objectMetadataItems.length) && (
        <RelationPickerScope relationPickerScopeId="relation-picker">
          {children}
        </RelationPickerScope>
      )}
    </>
  );
};
