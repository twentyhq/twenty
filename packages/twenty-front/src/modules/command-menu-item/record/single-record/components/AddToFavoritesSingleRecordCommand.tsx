import { Command } from '@/command-menu-item/display/components/Command';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useCreateNavigationMenuItem } from '@/navigation-menu-item/hooks/useCreateNavigationMenuItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

export const AddToFavoritesSingleRecordCommand = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const { createNavigationMenuItem } = useCreateNavigationMenuItem();

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const handleClick = () => {
    if (!isDefined(recordStore)) {
      return;
    }

    createNavigationMenuItem(recordStore, objectMetadataItem.nameSingular);
  };

  return <Command onClick={handleClick} />;
};
