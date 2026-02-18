import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useTemporaryFieldsConfiguration = (
  objectNameSingular: string,
): FieldsConfiguration => {
  const { t } = useLingui();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const configuration = useMemo<FieldsConfiguration>(() => {
    if (!isDefined(objectMetadataItem)) {
      throw new Error('Object metadata item is not defined');
    }

    const fieldsToDisplay = objectMetadataItem.fields;

    if (fieldsToDisplay.length === 0) {
      throw new Error('No fields to display');
    }

    const generalFields: Array<{ fieldMetadataId: string; position: number }> =
      [];
    const otherFields: Array<{ fieldMetadataId: string; position: number }> =
      [];

    let generalPosition = 0;
    let otherPosition = 0;

    fieldsToDisplay.forEach((field) => {
      if (field.isCustom === true) {
        otherFields.push({
          fieldMetadataId: field.id,
          position: otherPosition++,
        });
      } else {
        generalFields.push({
          fieldMetadataId: field.id,
          position: generalPosition++,
        });
      }
    });

    const sections = [];

    if (generalFields.length > 0) {
      sections.push({
        id: `${objectNameSingular}-section-general`,
        title: t`General`,
        position: 0,
        fields: generalFields,
      });
    }

    if (otherFields.length > 0) {
      sections.push({
        id: `${objectNameSingular}-section-other`,
        title: t`Other`,
        position: 1,
        fields: otherFields,
      });
    }

    if (sections.length === 0) {
      throw new Error('No sections to display');
    }

    return {
      __typename: 'FieldsConfiguration',
      configurationType: 'FIELDS',
      sections,
    };
  }, [objectMetadataItem, objectNameSingular, t]);

  return configuration;
};
