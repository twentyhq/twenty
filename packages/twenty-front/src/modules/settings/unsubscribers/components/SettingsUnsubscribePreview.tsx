import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { Section } from 'twenty-ui/components';
import {
  Button,
  Checkbox,
  Radio,
  RadioGroup,
} from 'twenty-ui/primitives/input';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { UnsubscribeTopicVisibility } from '~/generated-metadata/graphql';

const StyledViewport = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[10]} ${themeCssVariables.spacing[6]};
`;

const StyledCard = styled(Card)`
  --card-background-color: ${themeCssVariables.background.primary};

  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  max-width: 420px;
  padding: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledHeader = styled.div`
  text-align: center;

  h2 {
    font-size: 20px;
  }
`;

const StyledTopics = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTopicRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTrackingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledTrackingTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledTrackingHint = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const SettingsUnsubscribePreview = () => {
  const { t } = useLingui();
  const { unsubscribeTopics, loading } = useUnsubscribeTopics();

  const publicTopics = unsubscribeTopics.filter(
    (topic) => topic.visibility === UnsubscribeTopicVisibility.PUBLIC,
  );

  const hasPublicTopics = publicTopics.length > 0;

  return (
    <Section.Root>
      <Section.Header
        title={t`Unsubscribe page`}
        description={t`Preview of the page recipients see when they unsubscribe`}
      />
      <StyledViewport>
        {!loading && (
          <StyledCard rounded>
            <StyledHeader>
              <Section.Header
                title={t`Do you want to unsubscribe?`}
                description={t`Confirm your preferences:`}
              />
            </StyledHeader>
            {hasPublicTopics && (
              <StyledTopics>
                {publicTopics.map((topic) => (
                  <StyledTopicRow key={topic.id}>
                    <Checkbox
                      checked
                      onCheckedChange={() => {}}
                      aria-label={topic.name ?? t`Untitled topic`}
                    />
                    {topic.name ?? t`Untitled topic`}
                  </StyledTopicRow>
                ))}
              </StyledTopics>
            )}
            <StyledTrackingSection>
              <StyledTrackingTitle>{t`Email tracking`}</StyledTrackingTitle>
              <StyledTrackingHint>
                {t`This sender records which links you click in its emails. You can opt out for this email address.`}
              </StyledTrackingHint>
              <RadioGroup
                value="GRANTED"
                onValueChange={() => {}}
                aria-label={t`Email tracking`}
              >
                <StyledTopicRow>
                  <Radio
                    value="GRANTED"
                    aria-label={t`Keep tracking my clicks`}
                  />
                  {t`Keep tracking my clicks`}
                </StyledTopicRow>
                <StyledTopicRow>
                  <Radio
                    value="DENIED"
                    aria-label={t`Opt out of click tracking`}
                  />
                  {t`Opt out of click tracking`}
                </StyledTopicRow>
              </RadioGroup>
            </StyledTrackingSection>
            <Button fullWidth variant="solid" color="accent">
              {t`Update`}
            </Button>
            <HorizontalSeparator text={t`Or`} noMargin />
            <Button fullWidth variant="outline">
              {t`Unsubscribe all`}
            </Button>
          </StyledCard>
        )}
      </StyledViewport>
    </Section.Root>
  );
};
