import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { useCreateNavigationMenuItem } from '@/navigation-menu-item/hooks/useCreateNavigationMenuItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const AddToFavoritesSingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const isNavigationMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED,
  );

  const { createFavorite } = useCreateFavorite();
  const { createNavigationMenuItem } = useCreateNavigationMenuItem();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const handleClick = () => {
    if (!isDefined(selectedRecord)) {
      return;
    }

    if (isNavigationMenuItemEnabled) {
      createNavigationMenuItem(selectedRecord, objectMetadataItem.nameSingular);
    } else {
      createFavorite(selectedRecord, objectMetadataItem.nameSingular);
    }
  };

  return <Action onClick={handleClick} />;
};
