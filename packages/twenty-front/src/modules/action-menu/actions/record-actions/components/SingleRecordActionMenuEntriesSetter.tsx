import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ManageFavoritesActionEffect } from '@/action-menu/actions/record-actions/components/ManageFavoritesActionEffect';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { useMemo } from 'react';

export const SingleRecordActionMenuEntriesSetter = ({
  objectMetadataItem,
  isInRightDrawer = false,
}: {
  objectMetadataItem: ObjectMetadataItem;
  isInRightDrawer?: boolean;
}) => {
  const { closeRightDrawer } = useRightDrawer();

  const actions = useMemo(
    () => [
      {
        ActionEffect: ManageFavoritesActionEffect,
      },
      {
        ActionEffect: ExportRecordsActionEffect,
        onActionExecutedCallback: isInRightDrawer
          ? closeRightDrawer
          : undefined,
      },
      {
        ActionEffect: DeleteRecordsActionEffect,
        onActionExecutedCallback: isInRightDrawer
          ? closeRightDrawer
          : undefined,
      },
    ],
    [isInRightDrawer, closeRightDrawer],
  );

  return (
    <>
      {actions.map(({ ActionEffect, onActionExecutedCallback }, index) => (
        <ActionEffect
          key={index}
          position={index}
          objectMetadataItem={objectMetadataItem}
          onActionExecutedCallback={onActionExecutedCallback}
        />
      ))}
    </>
  );
};
