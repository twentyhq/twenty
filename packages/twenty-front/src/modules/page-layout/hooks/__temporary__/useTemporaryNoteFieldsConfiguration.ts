import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

/**
 * TEMPORARY HOOK FOR TESTING PURPOSE
 *
 * This hook dynamically builds a FieldsConfiguration for the Note object
 * using actual field metadata IDs from the backend, avoiding hardcoded UUIDs
 * that would differ across workspaces.
 *
 * TODO: Remove this hook once proper configuration management is implemented.
 */
export const useTemporaryNoteFieldsConfiguration =
  (): FieldsConfiguration | null => {
    const { objectMetadataItem } = useObjectMetadataItem({
      objectNameSingular: 'note',
    });

    console.log('objectMetadataItem', objectMetadataItem);

    const configuration = useMemo<FieldsConfiguration | null>(() => {
      if (!isDefined(objectMetadataItem)) {
        return null;
      }

      // Find the field metadata items we want to display
      const titleField = objectMetadataItem.fields.find(
        (field) => field.name === 'title',
      );
      const createdByField = objectMetadataItem.fields.find(
        (field) => field.name === 'createdBy',
      );
      const createdAtField = objectMetadataItem.fields.find(
        (field) => field.name === 'createdAt',
      );
      const updatedAtField = objectMetadataItem.fields.find(
        (field) => field.name === 'updatedAt',
      );

      // Build fields array with only the fields that exist
      const fields: Array<{
        fieldMetadataId: string;
        position: number;
      }> = [];

      let position = 0;
      if (isDefined(titleField)) {
        fields.push({ fieldMetadataId: titleField.id, position: position++ });
      }
      if (isDefined(createdByField)) {
        fields.push({
          fieldMetadataId: createdByField.id,
          position: position++,
        });
      }
      if (isDefined(createdAtField)) {
        fields.push({
          fieldMetadataId: createdAtField.id,
          position: position++,
        });
      }
      if (isDefined(updatedAtField)) {
        fields.push({
          fieldMetadataId: updatedAtField.id,
          position: position++,
        });
      }

      console.log('Temporary Note FieldsConfiguration fields:', fields);

      // If no fields found, return null
      if (fields.length === 0) {
        return null;
      }

      return {
        sections: [
          {
            id: 'note-section-general',
            title: 'General',
            position: 0,
            fields,
          },
        ],
      };
    }, [objectMetadataItem]);

    return configuration;
  };
