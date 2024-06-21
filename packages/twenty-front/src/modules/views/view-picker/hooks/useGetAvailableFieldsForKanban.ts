import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useGetAvailableFieldsForKanban = () => {
  const { viewObjectMetadataIdState } = useViewStates();

  const viewObjectMetadataId = useRecoilValue(viewObjectMetadataIdState);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadata) => objectMetadata.id === viewObjectMetadataId,
  );

  const availableFieldsForKanban =
    objectMetadataItem?.fields.filter(
      (field) => field.type === FieldMetadataType.Select,
    ) ?? [];

  const navigate = useNavigate();

  const navigateToSelectSettings = useCallback(() => {
    navigate(`/settings/objects/${objectMetadataItem?.namePlural}`);
  }, [navigate, objectMetadataItem?.namePlural]);

  return {
    availableFieldsForKanban,
    navigateToSelectSettings,
  };
};
