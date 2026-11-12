import { GettingStartedStepPreview } from '@/getting-started/components/step-preview/GettingStartedStepPreview';
import { GettingStartedStepPreviewAgentRun } from '@/getting-started/components/step-preview/GettingStartedStepPreviewAgentRun';
import { GettingStartedStepPreviewFloatingCard } from '@/getting-started/components/step-preview/GettingStartedStepPreviewFloatingCard';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { IconCalendarRepeat, IconMail, IconTargetArrow } from 'twenty-ui/icon';
import { Avatar, Chip, Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const DRAFT_RECIPIENTS = doNotTranslate([
  'Sarah Chen',
  'Tom Becker',
  'Ana Ruiz',
  'Leo Park',
]);

const StyledRun = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  height: 100%;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[5]};
`;

const StyledSchedule = styled.div`
  display: flex;
`;

const StyledDrafts = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: auto;
`;

const StyledDealTitle = styled.span`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
`;

export const GettingStartedFollowUpPreview = () => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <GettingStartedStepPreview
      note={t`Drafts only. You review and send.`}
      NoteIcon={IconMail}
    >
      <StyledRun>
        <StyledSchedule>
          <Tag
            color="purple"
            startIcon={<IconCalendarRepeat size={theme.icon.size.sm} />}
          >
            {t`Every Monday`}
          </Tag>
        </StyledSchedule>
        <GettingStartedStepPreviewAgentRun
          steps={[
            {
              id: 'find-deals',
              content: (
                <Trans>
                  Found <strong>4 deals</strong> closing in the next 30 days
                </Trans>
              ),
            },
            {
              id: 'read-history',
              content: t`Read the last emails and meetings for each`,
            },
            {
              id: 'draft-emails',
              content: (
                <Trans>
                  Drafted <strong>4 follow-up emails</strong>
                </Trans>
              ),
            },
          ]}
        />
        <StyledDrafts>
          {DRAFT_RECIPIENTS.map((recipient) => (
            <Chip
              key={recipient}
              size="md"
              variant="soft"
              color="primary"
              startElement={
                <>
                  <IconMail
                    size={theme.icon.size.sm}
                    color={themeCssVariables.font.color.tertiary}
                  />
                  <Avatar
                    shape="circle"
                    size="sm"
                    name={recipient}
                    colorSeed={recipient}
                  />
                </>
              }
            >
              {recipient}
            </Chip>
          ))}
        </StyledDrafts>
      </StyledRun>
      <GettingStartedStepPreviewFloatingCard
        color="orange"
        top={40}
        right={32}
        width={170}
        rotate={6}
        delayMs={300}
      >
        <StyledDealTitle>
          <IconTargetArrow size={theme.icon.size.sm} />
          {doNotTranslate('Figma renewal')}
        </StyledDealTitle>
        {t`Closes in 6 days`}
      </GettingStartedStepPreviewFloatingCard>
    </GettingStartedStepPreview>
  );
};
