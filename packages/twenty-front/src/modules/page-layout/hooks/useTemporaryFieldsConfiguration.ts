import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useTemporaryFieldsConfiguration = (
  objectNameSingular: string,
): FieldsConfiguration | null => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const configuration = useMemo<FieldsConfiguration | null>(() => {
    if (!isDefined(objectMetadataItem)) {
      return null;
    }

    const fieldsToDisplay = objectMetadataItem.fields.filter(
      (field) =>
        field.type !== FieldMetadataType.RELATION &&
        field.type !== FieldMetadataType.MORPH_RELATION &&
        field.type !== FieldMetadataType.RICH_TEXT_V2,
    );

    const fields = fieldsToDisplay.map((field, index) => ({
      fieldMetadataId: field.id,
      position: index,
    }));

    if (fields.length === 0) {
      return null;
    }

    return {
      sections: [
        {
          id: `${objectNameSingular}-section-general`,
          title: 'General',
          position: 0,
          fields,
        },
      ],
    };
  }, [objectMetadataItem, objectNameSingular]);

  return configuration;
};
