import { useEffect } from 'react';

import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { IdentifiersMapper } from '@/object-record/relation-picker/types/IdentifiersMapper';
import { getLogoUrlFromDomainName } from '~/utils';

export const ObjectMetadataItemsRelationPickerEffect = () => {
  const { setIdentifiersMapper, setSearchQuery } = useRelationPicker({
    relationPickerScopeId: 'relation-picker',
  });

  const computeFilterFields = (relationPickerType: string) => {
    if (relationPickerType === 'company') {
      return ['name'];
    }

    if (['workspaceMember', 'person'].includes(relationPickerType)) {
      return ['name.firstName', 'name.lastName'];
    }

    return ['name'];
  };

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
        avatarUrl: getLogoUrlFromDomainName(record.domainName ?? ''),
        avatarType: 'squared',
        record: record,
      };
    }

    if (
      ['workspaceMember', 'person'].includes(objectMetadataItemSingularName)
    ) {
      return {
        id: record.id,
        name:
          (record.name?.firstName ?? '') + ' ' + (record.name?.lastName ?? ''),
        avatarUrl: record.avatarUrl,
        avatarType: 'rounded',
        record: record,
      };
    }

    if (['opportunity'].includes(objectMetadataItemSingularName)) {
      return {
        id: record.id,
        name: record?.company?.name,
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
    setSearchQuery({
      computeFilterFields,
    });
  }, [setIdentifiersMapper, setSearchQuery]);

  return <></>;
};
