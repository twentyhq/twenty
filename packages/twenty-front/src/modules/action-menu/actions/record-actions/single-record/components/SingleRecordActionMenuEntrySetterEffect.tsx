import { ActionAvailableOn } from '@/action-menu/actions/types/ActionAvailableOn';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { useActionMenuEntriesWithCallbacks } from '@/action-menu/hooks/useActionMenuEntriesWithCallbacks';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useEffect } from 'react';

export const SingleRecordActionMenuEntrySetterEffect = ({
  objectMetadataItem,
  viewType,
}: {
  objectMetadataItem: ObjectMetadataItem;
  viewType: ActionAvailableOn;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const { actionMenuEntries } = useActionMenuEntriesWithCallbacks(
    objectMetadataItem,
    viewType,
  );

  useEffect(() => {
    for (const action of actionMenuEntries) {
      addActionMenuEntry(action);
    }

    return () => {
      for (const action of actionMenuEntries) {
        removeActionMenuEntry(action.key);
      }
    };
  }, [actionMenuEntries, addActionMenuEntry, removeActionMenuEntry]);

  return null;
};
