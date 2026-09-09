import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CampaignEnvelopeBox } from '@/activities/emails/components/CampaignEnvelopeBox';
import { useCreateMessageCampaignFollowUpDraft } from '@/activities/emails/hooks/useCreateMessageCampaignFollowUpDraft';
import { useMessageCampaignEngagement } from '@/activities/emails/hooks/useMessageCampaignEngagement';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { GraphWidgetLineChart } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChart';
import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartSeriesWithColor';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { Select } from '@/ui/input/components/Select';
import { IconMail } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { CampaignEngagementActivityFilter } from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNow, formatDate } from '~/utils/date-utils';

const StyledBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};

  & + & {
    border-top: 1px solid ${themeCssVariables.border.color.medium};
  }
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSummary = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledChart = styled.div`
  height: 160px;
  width: 100%;
`;

const StyledRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: grid;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: minmax(0, 1fr) auto auto;
`;

const StyledUrl = styled.span`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type CampaignEngagementSectionProps = {
  campaign: MessageCampaign;
  width: string;
};

const CHART_ID = 'campaign-engagement-line-chart';

export const CampaignEngagementSection = ({
  campaign,
  width,
}: CampaignEngagementSectionProps) => {
  const [activityFilter, setActivityFilter] =
    useState<CampaignEngagementActivityFilter>(
      CampaignEngagementActivityFilter.FILTERED,
    );

  const { engagement, isLoading, hasFailed } = useMessageCampaignEngagement({
    messageCampaignId: campaign.id,
    activityFilter,
    skip: !campaign.isClickTrackingEnabled,
  });

  const { createFollowUpDraft, isCreating } =
    useCreateMessageCampaignFollowUpDraft();

  const recipientPersonIds = (engagement?.recipients ?? []).map(
    (recipient) => recipient.personId,
  );

  // Resolved through the ordinary record query so Person permissions and
  // deletions apply; a person missing from the result is not shown by name.
  const { records: people } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: { id: { in: recipientPersonIds } },
    skip: recipientPersonIds.length === 0,
  });
  const personById = new Map(people.map((person) => [person.id, person]));

  if (!campaign.isClickTrackingEnabled) {
    return null;
  }

  const filterOptions = [
    { value: CampaignEngagementActivityFilter.FILTERED, label: t`Filtered` },
    { value: CampaignEngagementActivityFilter.ALL, label: t`All activity` },
  ];

  const series: LineChartSeriesWithColor[] = isDefined(engagement)
    ? [
        {
          key: 'clicks',
          label: t`Clicks`,
          data: engagement.series.map((point) => ({
            x: formatDate(point.bucketStart, 'MMM d HH:mm'),
            y: point.clicks,
          })),
        },
      ]
    : [];

  return (
    <CampaignEnvelopeBox width={width}>
      <StyledBlock>
        <StyledHeader>
          <StyledTitle>{t`Engagement`}</StyledTitle>
          <Select
            dropdownId="campaign-engagement-activity-filter"
            value={activityFilter}
            options={filterOptions}
            onChange={setActivityFilter}
            needIconCheck
            selectSizeVariant="small"
          />
        </StyledHeader>
        {hasFailed && <StyledHint>{t`Engagement is unavailable.`}</StyledHint>}
        {isDefined(engagement) && !engagement.isAvailable && (
          <StyledHint>{t`Engagement analytics are not configured on this instance.`}</StyledHint>
        )}
        {isDefined(engagement) && engagement.isAvailable && (
          <StyledSummary>
            <span>
              {t`Clicked`} {engagement.uniqueClickers} · {t`Total clicks`}{' '}
              {engagement.totalClicks}
            </span>
            {isDefined(engagement.calculatedAt) && (
              <StyledHint>
                {t`Updated`}{' '}
                {beautifyPastDateRelativeToNow(engagement.calculatedAt)}
              </StyledHint>
            )}
          </StyledSummary>
        )}
      </StyledBlock>
      {isDefined(engagement) &&
        engagement.isAvailable &&
        engagement.series.length > 0 && (
          <StyledBlock>
            <StyledChart>
              <WidgetComponentInstanceContext.Provider
                value={{ instanceId: CHART_ID }}
              >
                <GraphWidgetLineChart
                  id={CHART_ID}
                  data={series}
                  colorMode="automaticPalette"
                  showLegend
                  enableArea
                  displayType="number"
                />
              </WidgetComponentInstanceContext.Provider>
            </StyledChart>
          </StyledBlock>
        )}
      {isDefined(engagement) && engagement.links.length > 0 && (
        <StyledBlock>
          <StyledRow>
            <StyledHint>{t`Link`}</StyledHint>
            <StyledHint>{t`Unique`}</StyledHint>
            <StyledHint>{t`Total`}</StyledHint>
          </StyledRow>
          {engagement.links.map((link) => (
            <StyledRow key={link.authoredUrl}>
              <StyledUrl title={link.authoredUrl}>{link.authoredUrl}</StyledUrl>
              <span>{link.uniqueClickers}</span>
              <span>{link.totalClicks}</span>
            </StyledRow>
          ))}
        </StyledBlock>
      )}
      {isDefined(engagement) && engagement.uniqueClickers > 0 && (
        <StyledBlock>
          <div>
            <Button
              Icon={IconMail}
              title={t`Create follow-up draft from clickers`}
              variant="secondary"
              size="small"
              disabled={isCreating}
              onClick={() =>
                createFollowUpDraft({
                  messageCampaignId: campaign.id,
                  activityFilter,
                })
              }
            />
          </div>
        </StyledBlock>
      )}
      {isDefined(engagement) && engagement.recipients.length > 0 && (
        <StyledBlock>
          <StyledHint>{t`Most recent activity`}</StyledHint>
          {engagement.recipients.map((recipient) => {
            const person = personById.get(recipient.personId);

            return (
              <StyledRow key={recipient.deliveryId}>
                {isDefined(person) ? (
                  <RecordChip
                    record={person}
                    objectNameSingular={CoreObjectNameSingular.Person}
                  />
                ) : (
                  <StyledHint>{t`Deleted or inaccessible contact`}</StyledHint>
                )}
                <StyledHint>{t`Clicked`}</StyledHint>
                <StyledHint>
                  {beautifyPastDateRelativeToNow(recipient.lastEngagedAt)}
                </StyledHint>
              </StyledRow>
            );
          })}
        </StyledBlock>
      )}
      {isLoading && !isDefined(engagement) && (
        <StyledBlock>
          <StyledHint>{t`Loading engagement…`}</StyledHint>
        </StyledBlock>
      )}
    </CampaignEnvelopeBox>
  );
};
