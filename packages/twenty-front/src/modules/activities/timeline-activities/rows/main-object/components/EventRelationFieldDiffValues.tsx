import { styled } from '@linaria/react';
import { useId, useMemo } from 'react';

import { isRelationFieldChangeValue } from '@/activities/timeline-activities/utils/relationFieldChangeValue';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui-deprecated/display';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

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

  const beforeDisplayName = resolveDisplayName(fieldDiff.before);
  const afterDisplayName = resolveDisplayName(fieldDiff.after);

  return (
    <RelationFieldDiffValue
      beforeDisplayName={beforeDisplayName}
      afterDisplayName={afterDisplayName}
    />
  );
};

const RelationFieldDiffValue = ({
  beforeDisplayName,
  afterDisplayName,
}: {
  beforeDisplayName: string | null;
  afterDisplayName: string | null;
}) => {
  const { t } = useLingui();
  const instanceId = useId();

  // react-tooltip anchors via a CSS selector, so the id must be selector-safe
  const tooltipAnchorId = `relation-field-diff-${instanceId.replace(
    /[^a-zA-Z0-9-_]/g,
    '-',
  )}`;

  const emptyLabel = t`Empty`;
  const tooltipContent = `${beforeDisplayName ?? emptyLabel} → ${
    afterDisplayName ?? emptyLabel
  }`;

  return (
    <>
      {afterDisplayName !== null ? (
        <StyledRelationValue id={tooltipAnchorId}>
          {afterDisplayName}
        </StyledRelationValue>
      ) : (
        <StyledEmptyValue id={tooltipAnchorId}>
          <Trans>Empty</Trans>
        </StyledEmptyValue>
      )}
      <AppTooltip
        anchorSelect={`#${tooltipAnchorId}`}
        content={tooltipContent}
        delay={TooltipDelay.shortDelay}
        place={TooltipPosition.Bottom}
        positionStrategy="fixed"
      />
    </>
  );
};

export const EventRelationFieldDiffValues = ({
  fieldDiff,
  fieldMetadataItem,
}: EventRelationFieldDiffValuesProps) => {
  const relationTargetObjectMetadataNameSingular =
    fieldMetadataItem.relation?.targetObjectMetadata.nameSingular;

  if (!isDefined(relationTargetObjectMetadataNameSingular)) {
    const beforeDisplayName = getRelationRecordId(fieldDiff.before);
    const afterDisplayName = getRelationRecordId(fieldDiff.after);

    return (
      <RelationFieldDiffValue
        beforeDisplayName={beforeDisplayName}
        afterDisplayName={afterDisplayName}
      />
    );
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
