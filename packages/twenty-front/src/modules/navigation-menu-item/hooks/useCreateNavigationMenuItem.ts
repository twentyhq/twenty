import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useCreateNavigationMenuItemMutation } from '~/generated-metadata/graphql';

export const useCreateNavigationMenuItem = () => {
  const { navigationMenuItems, currentWorkspaceMemberId } =
    usePrefetchedNavigationMenuItemsData();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const [createNavigationMenuItemMutation] =
    useCreateNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

  const createNavigationMenuItem = async (
    targetRecord: ObjectRecord,
    targetObjectNameSingular: string,
    favoriteFolderId?: string,
  ) => {
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === targetObjectNameSingular,
    );

    if (!isDefined(objectMetadataItem)) {
      throw new Error(
        `Object metadata item not found for nameSingular: ${targetObjectNameSingular}`,
      );
    }

    const relevantItems = favoriteFolderId
      ? navigationMenuItems.filter(
          (item) => item.favoriteFolderId === favoriteFolderId,
        )
      : navigationMenuItems.filter(
          (item) => !item.favoriteFolderId && item.forWorkspaceMemberId,
        );

    const maxPosition = Math.max(
      ...relevantItems.map((item) => item.position),
      0,
    );

    await createNavigationMenuItemMutation({
      variables: {
        input: {
          targetRecordId: targetRecord.id,
          targetObjectMetadataId: objectMetadataItem.id,
          forWorkspaceMemberId: currentWorkspaceMemberId ?? undefined,
          favoriteFolderId: favoriteFolderId ?? undefined,
          position: maxPosition + 1,
        },
      },
    });
  };

  return { createNavigationMenuItem };
};
