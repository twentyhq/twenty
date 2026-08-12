import { useCallback, useMemo } from 'react';

import { type RelatedPersonResolution } from '@/activities/emails/related-people/types/RelatedPersonResolution';
import { buildRelatedPersonSourceRecordGqlFields } from '@/activities/emails/related-people/utils/buildRelatedPersonSourceRecordGqlFields';
import { getRelatedPersonFieldMetadataItems } from '@/activities/emails/related-people/utils/getRelatedPersonFieldMetadataItems';
import { resolveRelatedPeopleFromSourceRecords } from '@/activities/emails/related-people/utils/resolveRelatedPeopleFromSourceRecords';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

export type ResolveRelatedPeopleResult = RelatedPersonResolution & {
  hasUnreadSourceRecords: boolean;
};

export const useResolveRelatedPeople = ({
  objectMetadataItem,
  filter,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  filter: RecordGqlOperationFilter | undefined;
}) => {
  const relatedPersonFieldMetadataItems = useMemo(
    () => getRelatedPersonFieldMetadataItems(objectMetadataItem),
    [objectMetadataItem],
  );

  const labelIdentifierFieldMetadataItem = useMemo(
    () => getLabelIdentifierFieldMetadataItem(objectMetadataItem),
    [objectMetadataItem],
  );

  const recordGqlFields = useMemo(
    () =>
      buildRelatedPersonSourceRecordGqlFields({
        relatedPersonFieldMetadataItems,
        labelIdentifierFieldMetadataItem,
      }),
    [relatedPersonFieldMetadataItems, labelIdentifierFieldMetadataItem],
  );

  const { findManyRecordsLazy } = useLazyFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter,
    recordGqlFields,
    limit: MAX_EMAIL_RECIPIENTS,
  });

  const resolveRelatedPeople = useCallback(
    async (
      relatedPersonFieldMetadataItem: FieldMetadataItem,
    ): Promise<ResolveRelatedPeopleResult> => {
      const { records, hasNextPage } = await findManyRecordsLazy();

      const joinColumnName = computeRelationGqlFieldJoinColumnName({
        name: relatedPersonFieldMetadataItem.name,
      });

      const resolution = resolveRelatedPeopleFromSourceRecords(
        (records ?? []).map((record) => ({
          id: record.id,
          label: getLabelIdentifierFieldValue(
            record,
            labelIdentifierFieldMetadataItem,
          ),
          relatedPersonId: record[joinColumnName] ?? null,
        })),
      );

      return { ...resolution, hasUnreadSourceRecords: hasNextPage };
    },
    [findManyRecordsLazy, labelIdentifierFieldMetadataItem],
  );

  return { relatedPersonFieldMetadataItems, resolveRelatedPeople };
};
