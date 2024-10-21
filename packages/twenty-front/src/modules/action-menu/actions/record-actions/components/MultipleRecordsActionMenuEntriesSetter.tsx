import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

const actionEffects = [ExportRecordsActionEffect, DeleteRecordsActionEffect];

export const MultipleRecordsActionMenuEntriesSetter = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
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
