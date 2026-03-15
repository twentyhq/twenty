import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { useCallback } from 'react';

export const useLoadMockedMinimalMetadata = () => {
  const { updateDraft, applyChanges } = useMetadataStore();

  const loadMockedMinimalMetadata = useCallback(async () => {
    const { generatedMockObjectMetadataItems } = await import(
      '~/testing/utils/generatedMockObjectMetadataItems'
    );

    const minimalObjects: FlatObjectMetadataItem[] =
      generatedMockObjectMetadataItems.map((item) => ({
        id: item.id,
        nameSingular: item.nameSingular,
        namePlural: item.namePlural,
        labelSingular: item.labelSingular,
        labelPlural: item.labelPlural,
        icon: item.icon,
        isCustom: item.isCustom,
        isActive: item.isActive,
        isSystem: item.isSystem,
        isRemote: item.isRemote,
      })) as FlatObjectMetadataItem[];

    updateDraft('objectMetadataItems', minimalObjects);
    applyChanges();
  }, [updateDraft, applyChanges]);

  return { loadMockedMinimalMetadata };
};
