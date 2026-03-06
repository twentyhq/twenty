import { CommandMenuItem } from '@/command-menu-item/actions/components/CommandMenuItem';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

export const AddToFavoritesSingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const { createFavorite } = useCreateFavorite();

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const handleClick = () => {
    if (!isDefined(recordStore)) {
      return;
    }

    createFavorite(recordStore, objectMetadataItem.nameSingular);
  };

  return <CommandMenuItem onClick={handleClick} />;
};
