import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ActionMenuType } from '@/action-menu/types/ActionMenuType';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

const actionEffects = [ExportRecordsActionEffect, DeleteRecordsActionEffect];

export const MultipleRecordsActionMenuEntriesSetter = ({
  objectMetadataItem,
  actionMenuType,
}: {
  objectMetadataItem: ObjectMetadataItem;
  actionMenuType: ActionMenuType;
}) => {
  return (
    <>
      {actionEffects.map((ActionEffect, index) => (
        <ActionEffect
          key={index}
          position={index}
          objectMetadataItem={objectMetadataItem}
          actionMenuType={actionMenuType}
        />
      ))}
    </>
  );
};
