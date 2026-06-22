import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledLinkedRecord = styled.span`
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  text-decoration: underline;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

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

const StyledItemTitleDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${themeCssVariables.font.color.tertiary};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

type EventRowGenericLinkedProps = EventRowDynamicComponentProps;

export const EventRowGenericLinked = ({
  event,
  authorFullName,
  linkedObjectMetadataItem,
  createdAt,
}: EventRowGenericLinkedProps) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const objectLabel =
    linkedObjectMetadataItem?.labelSingular?.toLowerCase() ?? t`record`;

  const linkedRecordName = isNonEmptyString(event.linkedRecordCachedName)
    ? event.linkedRecordCachedName
    : t`Untitled`;

  const canOpen =
    isDefined(event.linkedRecordId) &&
    isDefined(linkedObjectMetadataItem?.nameSingular);

  return (
    <StyledRowContainer>
      <StyledRow>
        <EventRowItem>{authorFullName}</EventRowItem>
        <EventRowItem variant="action">
          {t`linked a ${objectLabel}`}
        </EventRowItem>
        <StyledLinkedRecord
          onClick={() => {
            if (!canOpen) {
              return;
            }

            openRecordInSidePanel({
              recordId: event.linkedRecordId as string,
              objectNameSingular:
                linkedObjectMetadataItem?.nameSingular as string,
            });
          }}
        >
          <OverflowingTextWithTooltip text={linkedRecordName} />
        </StyledLinkedRecord>
      </StyledRow>
      <StyledItemTitleDate>{createdAt}</StyledItemTitleDate>
    </StyledRowContainer>
  );
};
