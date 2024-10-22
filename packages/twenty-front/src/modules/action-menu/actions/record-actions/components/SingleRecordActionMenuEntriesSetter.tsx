import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ManageFavoritesActionEffect } from '@/action-menu/actions/record-actions/components/ManageFavoritesActionEffect';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const SingleRecordActionMenuEntriesSetter = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const actionEffects = [
    ManageFavoritesActionEffect,
    ExportRecordsActionEffect,
    DeleteRecordsActionEffect,
  ];
  return (
    <>
      {actionEffects.map((ActionEffect, index) => (
        <ActionEffect
          key={index}
          position={index}
          objectMetadataItem={objectMetadataItem}
        />
      ))}
    </>
  );
};
