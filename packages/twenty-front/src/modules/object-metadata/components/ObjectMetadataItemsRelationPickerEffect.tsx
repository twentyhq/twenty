import { useEffect } from 'react';

import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';

export const ObjectMetadataItemsRelationPickerEffect = () => {
  const { setSearchQuery } = useRelationPicker({
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

  useEffect(() => {
    setSearchQuery({ computeFilterFields });
  }, [setSearchQuery]);

  return <></>;
};
