import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { isRelationFieldChangeValue } from '@/activities/timeline-activities/utils/relationFieldChangeValue';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Trans } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventRelationFieldDiffValuesProps = {
  fieldDiff: { before: unknown; after: unknown };
  fieldMetadataItem: FieldMetadataItem;
};

const StyledRelationValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyValue = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const getRelationRecordId = (value: unknown): string | null => {
  if (!isRelationFieldChangeValue(value)) {
    return null;
  }

  if (!isDefined(value.id) || value.id === '') {
    return null;
  }

  return value.id;
};

const EventRelationFieldDiffValuesWithFetch = ({
  fieldDiff,
  relationTargetObjectMetadataNameSingular,
}: {
  fieldDiff: { before: unknown; after: unknown };
  relationTargetObjectMetadataNameSingular: string;
}) => {
  const relationRecordIds = useMemo(() => {
    const recordIds = new Set<string>();

    for (const relationFieldChangeValue of [
      fieldDiff.before,
      fieldDiff.after,
    ]) {
      const relationRecordId = getRelationRecordId(relationFieldChangeValue);

      if (isDefined(relationRecordId)) {
        recordIds.add(relationRecordId);
      }
    }

    return Array.from(recordIds);
  }, [fieldDiff.after, fieldDiff.before]);

  const { objectMetadataItem: relationTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationTargetObjectMetadataNameSingular,
    });

  const { records, loading } = useFindManyRecords({
    objectNameSingular: relationTargetObjectMetadataNameSingular,
    filter: {
      id: {
        in: relationRecordIds,
      },
    },
    skip: relationRecordIds.length === 0,
  });

  const recordsById = useMemo(
    () => new Map(records.map((record) => [record.id, record])),
    [records],
  );

  const resolveDisplayName = (value: unknown): string | null => {
    const relationRecordId = getRelationRecordId(value);

    if (!isDefined(relationRecordId)) {
      return null;
    }

    const relatedRecord = recordsById.get(relationRecordId);

    if (isDefined(relatedRecord)) {
      return getObjectRecordIdentifier({
        objectMetadataItem: relationTargetObjectMetadataItem,
        record: relatedRecord,
        allowRequestsToTwentyIcons: false,
      }).name;
    }

    if (loading) {
      return null;
    }

    return relationRecordId;
  };

  const afterDisplayName = resolveDisplayName(fieldDiff.after);

  return <RelationFieldDiffValue afterDisplayName={afterDisplayName} />;
};

const RelationFieldDiffValue = ({
  afterDisplayName,
}: {
  afterDisplayName: string | null;
}) => {
  return afterDisplayName !== null ? (
    <StyledRelationValue>{afterDisplayName}</StyledRelationValue>
  ) : (
    <StyledEmptyValue>
      <Trans>Empty</Trans>
    </StyledEmptyValue>
  );
};

export const EventRelationFieldDiffValues = ({
  fieldDiff,
  fieldMetadataItem,
}: EventRelationFieldDiffValuesProps) => {
  const relationTargetObjectMetadataNameSingular =
    fieldMetadataItem.relation?.targetObjectMetadata.nameSingular;

  if (!isDefined(relationTargetObjectMetadataNameSingular)) {
    const afterDisplayName = getRelationRecordId(fieldDiff.after);

    return <RelationFieldDiffValue afterDisplayName={afterDisplayName} />;
  }

  return (
    <EventRelationFieldDiffValuesWithFetch
      fieldDiff={fieldDiff}
      relationTargetObjectMetadataNameSingular={
        relationTargetObjectMetadataNameSingular
      }
    />
  );
};
