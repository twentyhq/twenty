import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

const actions = [
  {
    ActionEffect: ExportRecordsActionEffect,
    onActionExecutedCallback: () => {},
  },
  {
    ActionEffect: DeleteRecordsActionEffect,
    onActionExecutedCallback: () => {},
  },
];

export const MultipleRecordsActionMenuEntriesSetter = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
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
