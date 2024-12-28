import { useExportNoteToPdfAction } from '@/action-menu/actions/record-actions/right-drawer/hooks/useExportNoteToPdfAction';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { useEffect } from 'react';
import { isDefined } from 'twenty-ui';

export const RightDrawerActionMenuEntriesSetterEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { isRightDrawerOpen } = useRightDrawer();

  const { registerExportToPdfAction, unregisterExportToPdfAction } =
    useExportNoteToPdfAction();

  useEffect(() => {
    if (isRightDrawerOpen && isDefined(objectMetadataItem)) {
      registerExportToPdfAction({ position: 1 });

      return () => {
        unregisterExportToPdfAction();
      };
    }
  }, [
    isRightDrawerOpen,
    objectMetadataItem,
    registerExportToPdfAction,
    unregisterExportToPdfAction,
  ]);

  return null;
};
