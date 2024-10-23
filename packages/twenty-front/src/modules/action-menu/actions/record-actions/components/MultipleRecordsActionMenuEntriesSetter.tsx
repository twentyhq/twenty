import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

const actions = [
  {
    ActionEffect: ExportRecordsActionEffect,
  },
  {
    ActionEffect: DeleteRecordsActionEffect,
  },
];

export const MultipleRecordsActionMenuEntriesSetter = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  return (
    <>
      {actions.map(({ ActionEffect }, index) => (
        <ActionEffect
          key={index}
          position={index}
          objectMetadataItem={objectMetadataItem}
        />
      ))}
    </>
  );
};
