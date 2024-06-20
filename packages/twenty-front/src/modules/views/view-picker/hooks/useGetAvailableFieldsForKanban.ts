import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useGetAvailableFieldsForKanban = () => {
  const { viewObjectMetadataIdState } = useViewStates();
  const { viewPickerIsDirtyState } = useViewPickerStates();

  const viewObjectMetadataId = useRecoilValue(viewObjectMetadataIdState);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const setViewPickerIsDirty = useSetRecoilState(viewPickerIsDirtyState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadata) => objectMetadata.id === viewObjectMetadataId,
  );

  const availableFieldsForKanban =
    objectMetadataItem?.fields.filter(
      (field) => field.type === FieldMetadataType.Select,
    ) ?? [];

  const navigate = useNavigate();

  const navigateToSelectSettings = useCallback(() => {
    setViewPickerIsDirty(false);
    navigate(`/settings/objects/${objectMetadataItem?.namePlural}`);
  }, [navigate, objectMetadataItem?.namePlural, setViewPickerIsDirty]);

  return {
    availableFieldsForKanban,
    navigateToSelectSettings,
  };
};
