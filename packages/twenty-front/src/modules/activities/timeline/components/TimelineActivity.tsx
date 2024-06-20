import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { AppTooltip, Avatar, IconCheckbox, IconNotes } from 'twenty-ui';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { timelineActivityWithoutTargetsFamilyState } from '@/activities/timeline/states/timelineActivityWithoutTargetsFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

const StyledAvatarContainer = styled.div`
  align-items: center;
  display: flex;
  height: 26px;
  justify-content: center;
  user-select: none;
  width: 26px;
  z-index: 2;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 16px;
  justify-content: center;
  text-decoration-line: underline;
  width: 16px;
`;

const StyledActivityTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex: 1;
  font-weight: ${({ theme }) => theme.font.weight.regular};
  overflow: hidden;
`;

const StyledActivityLink = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  overflow: hidden;
  text-decoration-line: underline;
  text-overflow: ellipsis;
`;

const StyledItemContainer = styled.div`
  align-content: center;
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  span {
    color: ${({ theme }) => theme.font.color.secondary};
  }
  overflow: hidden;
`;

const StyledItemTitleContainer = styled.div`
  display: flex;
  flex: 1;
  flex-flow: row ${() => (useIsMobile() ? 'wrap' : 'nowrap')};
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
`;

const StyledItemAuthorText = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledItemTitle = styled.div`
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
`;

const StyledItemTitleDate = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  margin-left: auto;
`;

const StyledVerticalLineContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  width: 26px;
  z-index: 2;
`;

const StyledVerticalLine = styled.div`
  align-self: stretch;
  background: ${({ theme }) => theme.border.color.light};
  flex-shrink: 0;
  width: 2px;
`;

const StyledTimelineItemContainer = styled.div<{ isGap?: boolean }>`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  height: ${({ isGap, theme }) =>
    isGap ? (useIsMobile() ? theme.spacing(6) : theme.spacing(3)) : 'auto'};
  overflow: hidden;
  white-space: nowrap;
`;

type TimelineActivityProps = {
  isLastActivity?: boolean;
  activityId: string;
};

export const TimelineActivity = ({
  isLastActivity,
  activityId,
}: TimelineActivityProps) => {
  const activityForTimeline = useRecoilValue(
    timelineActivityWithoutTargetsFamilyState(activityId),
  );

  const beautifiedCreatedAt = activityForTimeline
    ? beautifyPastDateRelativeToNow(activityForTimeline.createdAt)
    : '';
  const exactCreatedAt = activityForTimeline
    ? beautifyExactDateTime(activityForTimeline.createdAt)
    : '';
  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const theme = useTheme();

  const activityFromStore = useRecoilValue(
    recordStoreFamilyState(activityForTimeline?.id ?? ''),
  );

  if (!activityForTimeline) {
    return <></>;
  }

  return (
    <>
      <StyledTimelineItemContainer>
        <StyledAvatarContainer>
          <Avatar
            avatarUrl={getImageAbsoluteURIOrBase64(
              activityForTimeline.author?.avatarUrl,
            )}
            placeholder={activityForTimeline.author?.name.firstName ?? ''}
            size="sm"
            type="rounded"
          />
        </StyledAvatarContainer>
        <StyledItemContainer>
          <StyledItemTitleContainer>
            <StyledItemAuthorText>
              <span>
                {activityForTimeline.author?.name.firstName}{' '}
                {activityForTimeline.author?.name.lastName}
              </span>
              created a {activityForTimeline.type.toLowerCase()}
            </StyledItemAuthorText>
            <StyledItemTitle>
              <StyledIconContainer>
                {activityForTimeline.type === 'Note' && (
                  <IconNotes size={theme.icon.size.sm} />
                )}
                {activityForTimeline.type === 'Task' && (
                  <IconCheckbox size={theme.icon.size.sm} />
                )}
              </StyledIconContainer>
              {(activityForTimeline.type === 'Note' ||
                activityForTimeline.type === 'Task') && (
                <StyledActivityTitle
                  onClick={() =>
                    openActivityRightDrawer(activityForTimeline.id)
                  }
                >
                  “
                  <StyledActivityLink
                    title={activityFromStore?.title ?? '(No Title)'}
                  >
                    {activityFromStore?.title ?? '(No Title)'}
                  </StyledActivityLink>
                  “
                </StyledActivityTitle>
              )}
            </StyledItemTitle>
          </StyledItemTitleContainer>
          <StyledItemTitleDate id={`id-${activityForTimeline.id}`}>
            {beautifiedCreatedAt}
          </StyledItemTitleDate>
          <AppTooltip
            anchorSelect={`#id-${activityForTimeline.id}`}
            content={exactCreatedAt}
            clickable
            noArrow
          />
        </StyledItemContainer>
      </StyledTimelineItemContainer>
      {!isLastActivity && (
        <StyledTimelineItemContainer isGap>
          <StyledVerticalLineContainer>
            <StyledVerticalLine></StyledVerticalLine>
          </StyledVerticalLineContainer>
        </StyledTimelineItemContainer>
      )}
    </>
  );
};
