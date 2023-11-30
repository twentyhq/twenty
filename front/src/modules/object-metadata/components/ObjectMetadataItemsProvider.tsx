import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { RelationPickerScope } from '@/ui/input/components/internal/relation-picker/scopes/RelationPickerScope';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const { loading, objectMetadataItems: objectMetadataItemsFromServer } =
    useFindManyObjectMetadataItems();

  const mockObjectMetadataItems = getObjectMetadataItemsMock();

  const [objectMetadataItems, setObjectMetadataItems] = useRecoilState(
    objectMetadataItemsState,
  );

  useEffect(() => {
    if (
      objectMetadataItemsFromServer.length < 1 &&
      objectMetadataItems.length < 1
    ) {
      setObjectMetadataItems(mockObjectMetadataItems as any[]);
    }
  }, [
    objectMetadataItemsFromServer,
    objectMetadataItems,
    setObjectMetadataItems,
    mockObjectMetadataItems,
  ]);

  return loading || objectMetadataItems.length < 1 ? (
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
