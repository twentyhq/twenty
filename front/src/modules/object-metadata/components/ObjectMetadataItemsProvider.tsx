import { useRecoilState } from 'recoil';

import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { objectMetadataItemsLoadingState } from '@/object-metadata/states/objectMetadataItemsLoadingState';
import { RelationPickerScope } from '@/ui/input/components/internal/relation-picker/scopes/RelationPickerScope';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const { loading, objectMetadataItems } = useFindManyObjectMetadataItems();

  console.log({
    loading,
    objectMetadataItems,
  });

  const [objectMetadataItemsLoading] = useRecoilState(
    objectMetadataItemsLoadingState,
  );

  return loading ? (
    <></>
  ) : (
    <>
      <ObjectMetadataItemsRelationPickerEffect />
      <RelationPickerScope relationPickerScopeId="relation-picker">
        {children}
      </RelationPickerScope>
    </>
  );
};
