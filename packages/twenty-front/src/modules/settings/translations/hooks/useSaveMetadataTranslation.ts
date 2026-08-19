import { useUpdateOneFieldMetadataItem } from '@/object-metadata/hooks/useUpdateOneFieldMetadataItem';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const useSaveMetadataTranslation = () => {
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();

  // A null value removes the stored translation, reverting the locale to
  // shipped-or-canonical.
  const saveMetadataTranslation = async ({
    metadataName,
    recordId,
    objectMetadataId,
    locale,
    property,
    value,
  }: {
    metadataName: 'objectMetadata' | 'fieldMetadata';
    recordId: string;
    objectMetadataId?: string | null;
    locale: string;
    property: string;
    value: string | null;
  }) => {
    const translations = [{ locale, property, value }];

    if (metadataName === 'objectMetadata') {
      return updateOneObjectMetadataItem({
        idToUpdate: recordId,
        updatePayload: { translations },
      });
    }

    if (!isDefined(objectMetadataId)) {
      throw new Error(
        'Cannot save a field translation without its objectMetadataId',
      );
    }

    return updateOneFieldMetadataItem({
      objectMetadataId,
      fieldMetadataIdToUpdate: recordId,
      updatePayload: { translations },
    });
  };

  return { saveMetadataTranslation };
};
