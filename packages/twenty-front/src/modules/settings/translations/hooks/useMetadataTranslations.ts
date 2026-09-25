import { useQuery } from '@apollo/client/react';
import { useUpdateOneFieldMetadataItem } from '@/object-metadata/hooks/useUpdateOneFieldMetadataItem';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type MetadataTranslationRowValue } from '@/settings/translations/types/MetadataTranslationRowValue';
import { isDefined } from 'twenty-shared/utils';
import {
  type MetadataTranslationsInput,
  type MetadataTranslationsQuery,
  MetadataTranslationsDocument,
} from '~/generated-metadata/graphql';

export type MetadataTranslationRow =
  MetadataTranslationsQuery['metadataTranslations'][number];

export const useMetadataTranslations = (
  input: MetadataTranslationsInput | null,
) => {
  const { data, loading, refetch } = useQuery(MetadataTranslationsDocument, {
    variables: { input: input ?? {} },
    skip: !isDefined(input),
    fetchPolicy: 'cache-and-network',
  });
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();

  // A null value removes the stored translation, reverting the locale to
  // shipped-or-canonical. All rows must belong to the same metadata item, so
  // they go out in one update.
  const saveTranslationRows = async (
    rowValues: MetadataTranslationRowValue[],
  ) => {
    const [firstRowValue] = rowValues;

    if (!isDefined(firstRowValue)) {
      return;
    }

    const { row } = firstRowValue;
    const translations = rowValues.map(({ row, value }) => ({
      locale: row.locale,
      property: row.property,
      value,
    }));

    if (row.metadataName === 'objectMetadata') {
      await updateOneObjectMetadataItem({
        idToUpdate: row.recordId,
        updatePayload: { translations },
      });
    } else {
      if (!isDefined(row.objectMetadataId)) {
        throw new Error(
          'Cannot save a field translation without its objectMetadataId',
        );
      }

      await updateOneFieldMetadataItem({
        objectMetadataId: row.objectMetadataId,
        fieldMetadataIdToUpdate: row.recordId,
        updatePayload: { translations },
      });
    }

    await refetch();
  };

  return {
    metadataTranslations: data?.metadataTranslations ?? [],
    loading,
    refetch,
    saveTranslationRows,
  };
};
