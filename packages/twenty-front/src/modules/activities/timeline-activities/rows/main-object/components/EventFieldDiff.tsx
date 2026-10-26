import { styled } from '@linaria/react';

import { EventFieldDiffLabel } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffLabel';
import { EventFieldDiffValue } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValue';
import { EventFieldDiffValueEffect } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValueEffect';
import { EventRelationFieldDiffValues } from '@/activities/timeline-activities/rows/main-object/components/EventRelationFieldDiffValues';
import { isRelationFieldChangeValue } from '@/activities/timeline-activities/utils/relationFieldChangeValue';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { Trans, useLingui } from '@lingui/react/macro';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { FieldMetadataType } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';
import { doNotTranslate } from 'twenty-shared/i18n';

type EventFieldDiffProps = {
  fieldDiff: { before: unknown; after: unknown };
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem | undefined;
  diffArtificialRecordStoreId: string;
};

const StyledEventFieldDiffContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyValue = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledArrowContainer = styled.span`
  color: ${themeCssVariables.font.color.secondary};
`;

export const EventFieldDiff = ({
  fieldDiff,
  mainObjectMetadataItem,
  fieldMetadataItem,
  diffArtificialRecordStoreId,
}: EventFieldDiffProps) => {
  if (!fieldMetadataItem) {
    throw new Error(doNotTranslate('fieldMetadataItem is required'));
  }

  const isRelationFieldDiff =
    fieldMetadataItem.type === FieldMetadataType.RELATION &&
    (isRelationFieldChangeValue(fieldDiff.before) ||
      isRelationFieldChangeValue(fieldDiff.after));

  if (isRelationFieldDiff) {
    return (
      <StyledEventFieldDiffContainer>
        <EventFieldDiffLabel fieldMetadataItem={fieldMetadataItem} />
        <StyledArrowContainer>→</StyledArrowContainer>
        <EventRelationFieldDiffValues
          fieldDiff={fieldDiff}
          fieldMetadataItem={fieldMetadataItem}
        />
      </StyledEventFieldDiffContainer>
    );
  }

  const diffRecord = fieldDiff.after as Record<string, unknown> | undefined;

  const isValueEmpty = (value: unknown): boolean =>
    value === null || value === undefined || value === '';

  const isObjectEmpty = (objectValue: Record<string, unknown>): boolean =>
    Object.values(objectValue).every(isValueEmpty);

  const isUpdatedToEmpty =
    isValueEmpty(diffRecord) ||
    (typeof diffRecord === 'object' &&
      diffRecord !== null &&
      isObjectEmpty(diffRecord));

  const { t } = useLingui();
  const emptyLabel = t`Empty`;

  const formatDiffValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
      return emptyLabel;
    }
    if (typeof value === 'object') {
      if ('name' in (value as Record<string, unknown>)) {
        return String((value as any).name);
      }
      if ('label' in (value as Record<string, unknown>)) {
        return String((value as any).label);
      }
      if ('primary' in (value as Record<string, unknown>)) {
        return String((value as any).primary);
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const beforeText = formatDiffValue(fieldDiff.before);
  const afterText = formatDiffValue(fieldDiff.after);
  const tooltipContent = `${beforeText} → ${afterText}`;

  return (
    <StyledEventFieldDiffContainer>
      <EventFieldDiffLabel fieldMetadataItem={fieldMetadataItem} />
      <StyledArrowContainer>→</StyledArrowContainer>
      <Tooltip
        content={tooltipContent}
        delay={TooltipDelay.shortDelay}
        side="bottom"
        positionMethod="fixed"
      >
        {isUpdatedToEmpty ? (
          <StyledEmptyValue>
            <Trans>Empty</Trans>
          </StyledEmptyValue>
        ) : (
          <>
            <EventFieldDiffValueEffect
              diffArtificialRecordStoreId={diffArtificialRecordStoreId}
              mainObjectMetadataItem={mainObjectMetadataItem}
              fieldMetadataItem={fieldMetadataItem}
              diffRecord={diffRecord}
            />
            <EventFieldDiffValue
              diffArtificialRecordStoreId={diffArtificialRecordStoreId}
              mainObjectMetadataItem={mainObjectMetadataItem}
              fieldMetadataItem={fieldMetadataItem}
            />
          </>
        )}
      </Tooltip>
    </StyledEventFieldDiffContainer>
  );
};
