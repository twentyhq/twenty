import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

// ENSO — renders an aggregated consent change (grant/revoke) on the person's
// main timeline. The cached name carries the channel list + project + how
// (source/method); clicking it opens the underlying consent event record.

type EventRowEnsoConsentProps = EventRowDynamicComponentProps;

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

const StyledItemTitleDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${themeCssVariables.font.color.tertiary};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
`;

// $granted: green for a grant, danger for a revoke.
const StyledAction = styled.span<{ $granted: boolean }>`
  color: ${({ $granted }) =>
    $granted
      ? themeCssVariables.color.green
      : themeCssVariables.font.color.danger};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledLinkedRecord = styled.span`
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  text-decoration: underline;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const EventRowEnsoConsent = ({
  authorFullName,
  event,
  linkedObjectMetadataItem,
  createdAt,
}: EventRowEnsoConsentProps) => {
  const [, eventAction] = event.name.split('.');
  const granted = eventAction === 'granted';

  const cachedName = isNonEmptyString(event.linkedRecordCachedName)
    ? event.linkedRecordCachedName
    : t`consent`;

  // The "how" (grant source / revoke method) + whether the change was automatic
  // (pipeline) are carried in properties.
  const properties =
    (event.properties as { detail?: string; auto?: boolean } | null) ?? {};
  const detail = properties.detail;
  const isAutomatic = properties.auto === true;

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const linkedRecordId = event.linkedRecordId;
  const objectNameSingular = linkedObjectMetadataItem?.nameSingular;

  return (
    <StyledMainContainer>
      <StyledRowContainer>
        <StyledRow>
          <EventRowItem variant="action">
            <StyledAction $granted={granted}>
              {granted ? t`Consent granted` : t`Consent revoked`}
            </StyledAction>
          </EventRowItem>
          {isNonEmptyString(linkedRecordId) &&
          isNonEmptyString(objectNameSingular) ? (
            <StyledLinkedRecord
              onClick={() =>
                openRecordInSidePanel({
                  recordId: linkedRecordId,
                  objectNameSingular,
                })
              }
            >
              {cachedName}
            </StyledLinkedRecord>
          ) : (
            <EventRowItem>{cachedName}</EventRowItem>
          )}
          {isNonEmptyString(detail) && (
            <>
              <EventRowItem variant="action">{t`via`}</EventRowItem>
              <EventRowItem>{detail}</EventRowItem>
            </>
          )}
          {isAutomatic ? (
            <>
              <EventRowItem variant="action">{t`by`}</EventRowItem>
              <EventRowItem>ENSO CRM</EventRowItem>
            </>
          ) : (
            <>
              <EventRowItem variant="action">{t`by`}</EventRowItem>
              <EventRowItem>{authorFullName}</EventRowItem>
            </>
          )}
        </StyledRow>
        <StyledItemTitleDate>{createdAt}</StyledItemTitleDate>
      </StyledRowContainer>
    </StyledMainContainer>
  );
};
