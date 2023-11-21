import { useEffect } from 'react';

import { useRelationPicker } from '@/ui/input/components/internal/relation-picker/hooks/useRelationPicker';
import { IdentifiersMapper } from '@/ui/input/components/internal/relation-picker/types/IdentifiersMapper';

export const ObjectMetadataItemsRelationPickerEffect = () => {
  const { setIdentifiersMapper } = useRelationPicker();

  const identifierMapper: IdentifiersMapper = (
    record: any,
    objectMetadataItemSingularName: string,
  ) => {
    if (!record) {
      return;
    }

    if (objectMetadataItemSingularName === 'company') {
      return {
        id: record.id,
        name: record.name,
        avatarUrl: record.avatarUrl,
        avatarType: 'squared',
        record: record,
      };
    }

    if (objectMetadataItemSingularName === 'workspaceMember') {
      return {
        id: record.id,
        name: record.name.firstName + ' ' + record.name.lastName,
        avatarUrl: record.avatarUrl,
        avatarType: 'rounded',
        record: record,
      };
    }

    return {
      id: record.id,
      name: record.name,
      avatarUrl: record.avatarUrl,
      avatarType: 'rounded',
      record,
    };
  };

  useEffect(() => {
    setIdentifiersMapper(() => identifierMapper);
  }, [setIdentifiersMapper]);

  return <></>;
};
