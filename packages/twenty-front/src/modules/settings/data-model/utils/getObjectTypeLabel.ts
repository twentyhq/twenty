import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export type ObjectTypeLabel =
  | StandardObjectTypeLabel
  | CustomObjectTypeLabel
  | RemoteObjectTypeLabel;

type StandardObjectTypeLabel = {
  labelText: 'Standard';
  labelColor: 'blue';
};

type CustomObjectTypeLabel = {
  labelText: 'Custom';
  labelColor: 'orange';
};

type RemoteObjectTypeLabel = {
  labelText: 'Remote';
  labelColor: 'green';
};

export const getObjectTypeLabel = (
  objectMetadataItem: ObjectMetadataItem,
): ObjectTypeLabel =>
  objectMetadataItem.isCustom
    ? {
        labelText: 'Custom',
        labelColor: 'orange',
      }
    : objectMetadataItem.isRemote
      ? {
          labelText: 'Remote',
          labelColor: 'green',
        }
      : {
          labelText: 'Standard',
          labelColor: 'blue',
        };
