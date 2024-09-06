import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export type ObjectTypeLabel =
  | StandardObjectTypeLabel
  | CustomObjectTypeLabel
  | RemoteObjectTypeLabel;

type StandardObjectTypeLabel = {
  labelText: 'Padrão';
  labelColor: 'blue';
};

type CustomObjectTypeLabel = {
  labelText: 'Custom';
  labelColor: 'orange';
};

type RemoteObjectTypeLabel = {
  labelText: 'Remoto';
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
          labelText: 'Remoto',
          labelColor: 'green',
        }
      : {
          labelText: 'Padrão',
          labelColor: 'blue',
        };
