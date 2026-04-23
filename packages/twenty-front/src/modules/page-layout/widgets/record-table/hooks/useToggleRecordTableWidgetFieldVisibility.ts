import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { useCallback } from 'react';

export const useToggleRecordTableWidgetFieldVisibility = () => {
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const toggleRecordTableWidgetFieldVisibility = useCallback(
    (viewFieldId: string, isVisible: boolean) => {
      updateInDraft('viewFields', [
        { id: viewFieldId, isVisible } as FlatViewField,
      ]);

      applyChanges();
    },
    [applyChanges, updateInDraft],
  );

  return { toggleRecordTableWidgetFieldVisibility };
};
