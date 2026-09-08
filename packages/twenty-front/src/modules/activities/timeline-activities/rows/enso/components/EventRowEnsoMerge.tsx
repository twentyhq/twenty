import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

// ENSO — renders the "duplicates merged" timeline event (person-merge /
// company-merge). The merged-away record is soft-deleted, so there's no live
// record to link to: the absorbed identifiers ride in linkedRecordCachedName and
// the match key ("email", "VAT", "domain", …) in properties.matchedOn.

type EventRowEnsoMergeProps = EventRowDynamicComponentProps;

const StyledRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
`;

const StyledMerged = styled.span`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledItemTitleDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${themeCssVariables.font.color.tertiary};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

export const EventRowEnsoMerge = ({
  authorFullName,
  event,
  createdAt,
}: EventRowEnsoMergeProps) => {
  const mergedLabel = isNonEmptyString(event.linkedRecordCachedName)
    ? event.linkedRecordCachedName
    : t`a duplicate`;

  const matchedOn = event.properties?.matchedOn;
  const mergedCount = Number(event.properties?.mergedCount ?? 1);

  const verb = mergedCount > 1 ? t`Merged duplicates` : t`Merged duplicate`;

  const matchedSuffix = isNonEmptyString(matchedOn)
    ? `${t`matched on`} ${matchedOn}`
    : null;

  return (
    <StyledRowContainer>
      <StyledRow>
        <EventRowItem variant="action">{verb}</EventRowItem>
        <StyledMerged>{mergedLabel}</StyledMerged>
        {matchedSuffix !== null && (
          <EventRowItem>{`· ${matchedSuffix}`}</EventRowItem>
        )}
        <EventRowItem variant="action">{t`by`}</EventRowItem>
        <EventRowItem>{authorFullName}</EventRowItem>
      </StyledRow>
      <StyledItemTitleDate>{createdAt}</StyledItemTitleDate>
    </StyledRowContainer>
  );
};
