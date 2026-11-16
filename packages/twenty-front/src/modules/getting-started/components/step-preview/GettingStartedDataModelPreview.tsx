import { GettingStartedStepPreview } from '@/getting-started/components/step-preview/GettingStartedStepPreview';
import { GettingStartedStepPreviewAgentRun } from '@/getting-started/components/step-preview/GettingStartedStepPreviewAgentRun';
import { GettingStartedStepPreviewFloatingCard } from '@/getting-started/components/step-preview/GettingStartedStepPreviewFloatingCard';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  IconBuildingSkyscraper,
  IconMessage,
  IconRepeat,
  IconSparkles,
} from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledUserMessage = styled.div`
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  max-width: 300px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  position: absolute;
  right: ${themeCssVariables.spacing[5]};
  top: ${themeCssVariables.spacing[3]};
`;

const StyledAgentRunContainer = styled.div`
  left: ${themeCssVariables.spacing[5]};
  position: absolute;
  top: 58px;
`;

const StyledQuestion = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.purple11};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledQuestionDetail = styled.span`
  line-height: 1.35;
`;

const StyledAnswers = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAnswer = styled.span`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 20px;
  padding: 0 ${themeCssVariables.spacing[2]};

  &[data-primary] {
    background-color: ${themeCssVariables.color.blue};
    border-color: ${themeCssVariables.color.blue};
    color: ${themeCssVariables.font.color.inverted};
  }
`;

export const GettingStartedDataModelPreview = () => {
  const { t } = useLingui();
  const theme = useTheme();

  const subscriptionsLabel = t`Subscriptions`;
  const companiesLabel = t`Companies`;

  return (
    <GettingStartedStepPreview
      note={t`The agent asks before creating anything.`}
      NoteIcon={IconMessage}
    >
      <StyledUserMessage>{t`We sell subscriptions to design teams.`}</StyledUserMessage>
      <StyledAgentRunContainer>
        <GettingStartedStepPreviewAgentRun
          steps={[
            {
              id: 'create-object',
              content: (
                <Trans>
                  Created object{' '}
                  <Chip
                    size="sm"
                    variant="soft"
                    color="primary"
                    startElement={
                      <IconRepeat
                        size={theme.icon.size.sm}
                        color={themeCssVariables.tag.text.turquoise}
                      />
                    }
                  >
                    {subscriptionsLabel}
                  </Chip>
                </Trans>
              ),
            },
            {
              id: 'add-field',
              content: (
                <Trans>
                  Added <strong>Renewal date</strong> to{' '}
                  <Chip
                    size="sm"
                    variant="soft"
                    color="primary"
                    startElement={
                      <IconBuildingSkyscraper
                        size={theme.icon.size.sm}
                        color={themeCssVariables.font.color.tertiary}
                      />
                    }
                  >
                    {companiesLabel}
                  </Chip>
                </Trans>
              ),
            },
            {
              id: 'create-view',
              content: (
                <Trans>
                  Created view <strong>Renewals this quarter</strong>
                </Trans>
              ),
            },
          ]}
        />
      </StyledAgentRunContainer>
      <GettingStartedStepPreviewFloatingCard
        color="neutral"
        top={64}
        right={40}
        width={210}
        rotate={4}
        delayMs={300}
      >
        <StyledQuestion>
          <IconSparkles size={theme.icon.size.sm} />
          {t`Track invoices too?`}
        </StyledQuestion>
        <StyledQuestionDetail>
          {t`An Invoices object linked to Subscriptions and Companies.`}
        </StyledQuestionDetail>
        <StyledAnswers>
          <StyledAnswer data-primary>{t`Yes`}</StyledAnswer>
          <StyledAnswer>{t`Not now`}</StyledAnswer>
        </StyledAnswers>
      </GettingStartedStepPreviewFloatingCard>
    </GettingStartedStepPreview>
  );
};
