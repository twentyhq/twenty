import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useTemporaryFieldsConfiguration = (
  objectNameSingular: string,
): FieldsConfiguration | null => {
  const { t } = useLingui();
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

    if (fieldsToDisplay.length === 0) {
      return null;
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
      return null;
    }

    return {
      __typename: 'FieldsConfiguration',
      configurationType: 'FIELDS',
      sections,
    };
  }, [objectMetadataItem, objectNameSingular, t]);

  return configuration;
};
