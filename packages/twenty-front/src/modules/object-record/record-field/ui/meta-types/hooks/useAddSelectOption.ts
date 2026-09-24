import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useCallback } from 'react';
import { createPath, useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useAddSelectOption = (fieldMetadataId: string) => {
  const { fieldMetadataItem, objectMetadataItem } =
    useFieldMetadataItemById(fieldMetadataId);
  const location = useLocation();
  const navigateSettings = useNavigateSettings();

  const fieldName = fieldMetadataItem?.name;
  const objectNamePlural = objectMetadataItem?.namePlural;

  const addSelectOption = useCallback(
    (optionName: string) => {
      if (!fieldName || !objectNamePlural) return;

      navigateSettings(
        SettingsPath.ObjectFieldEdit,
        { objectNamePlural, fieldName },
        { newOption: optionName },
        { state: { returnTo: createPath(location) } },
      );
    },
    [fieldName, location, objectNamePlural, navigateSettings],
  );

  return { addSelectOption };
};
