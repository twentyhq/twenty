import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendar } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ActivityList } from '@/activities/components/ActivityList';
import { ActivityRow } from '@/activities/components/ActivityRow';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { beautifyExactDate } from '~/utils/date-utils';

type OpportunityMilestoneRecord = {
  __typename: 'OpportunityMilestone';
  id: string;
  name: string | null;
  status: string | null;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualEndDate: string | null;
  position: number | null;
  opportunityId: string | null;
  description: { markdown: string | null; blocknote: string | null } | null;
};

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

const StyledInner = styled.div`
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

// Override ActivityRow default 48px height — rows that show a description need
// two extra lines, and we want the empty-description rows to stay compact.
const StyledRowAdapter = styled.div`
  > div > div {
    height: auto;
    min-height: ${themeCssVariables.spacing[12]};
    padding-bottom: ${themeCssVariables.spacing[2]};
    padding-top: ${themeCssVariables.spacing[2]};
  }
`;

const StyledLeftSide = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledStatus = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  padding: 0 ${themeCssVariables.spacing[1]};
  text-transform: uppercase;
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: -webkit-box;
  font-size: ${themeCssVariables.font.size.sm};
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledRightSide = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  margin-left: ${themeCssVariables.spacing[3]};
  white-space: nowrap;
`;

const StyledDateRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDateLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  text-transform: uppercase;
`;

// Strip the most common markdown markers so the preview reads cleanly. The
// goal is "looks like prose" — not a faithful render. Keeps the function
// cheap and avoids pulling in a markdown parser just for two lines.
const stripMarkdownLite = (raw: string): string =>
  raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .trim();

export const MilestonesCard = () => {
  const targetRecord = useTargetRecord();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const isOpportunity = targetRecord.targetObjectNameSingular === 'opportunity';

  const { records, loading } = useFindManyRecords<OpportunityMilestoneRecord>({
    objectNameSingular: 'opportunityMilestone',
    filter: isOpportunity
      ? {
          and: [
            { opportunityId: { eq: targetRecord.id } },
            { status: { neq: 'DONE' } },
          ],
        }
      : undefined,
    orderBy: [{ actualEndDate: 'AscNullsLast' }],
    skip: !isOpportunity,
  });

  if (!isOpportunity) {
    return (
      <StyledEmpty>
        {t`Milestones are only available on Opportunities.`}
      </StyledEmpty>
    );
  }

  if (loading) {
    return <StyledEmpty>{t`Loading milestones…`}</StyledEmpty>;
  }

  if (records.length === 0) {
    return <StyledEmpty>{t`No milestones yet for this deal.`}</StyledEmpty>;
  }

  return (
    <StyledContainer>
      <StyledInner>
        <ActivityList>
          {records.map((milestone) => {
            const descriptionPreview = isDefined(milestone.description?.markdown)
              ? stripMarkdownLite(milestone.description.markdown)
              : '';
            return (
              <StyledRowAdapter key={milestone.id}>
                <ActivityRow
                  onClick={() => {
                    openRecordInSidePanel({
                      recordId: milestone.id,
                      objectNameSingular: 'opportunityMilestone',
                    });
                  }}
                >
                  <StyledLeftSide>
                    <StyledTitleRow>
                      <StyledTitle>
                        {milestone.name || t`Untitled milestone`}
                      </StyledTitle>
                      {isDefined(milestone.status) && milestone.status !== '' && (
                        <StyledStatus>{milestone.status}</StyledStatus>
                      )}
                    </StyledTitleRow>
                    {descriptionPreview !== '' && (
                      <StyledDescription>{descriptionPreview}</StyledDescription>
                    )}
                  </StyledLeftSide>
                  <StyledRightSide>
                    {isDefined(milestone.plannedEndDate) && (
                      <StyledDateRow>
                        <IconCalendar size={12} />
                        <StyledDateLabel>{t`Planned`}</StyledDateLabel>
                        {beautifyExactDate(milestone.plannedEndDate)}
                      </StyledDateRow>
                    )}
                    {isDefined(milestone.actualEndDate) && (
                      <StyledDateRow>
                        <IconCalendar size={12} />
                        <StyledDateLabel>{t`Actual`}</StyledDateLabel>
                        {beautifyExactDate(milestone.actualEndDate)}
                      </StyledDateRow>
                    )}
                  </StyledRightSide>
                </ActivityRow>
              </StyledRowAdapter>
            );
          })}
        </ActivityList>
      </StyledInner>
    </StyledContainer>
  );
};
