import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { Button, Checkbox } from 'twenty-ui/input';
import { HorizontalSeparator, Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { H2Title } from 'twenty-ui/typography';
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

export const SettingsUnsubscribePreview = () => {
  const { t } = useLingui();
  const { unsubscribeTopics } = useUnsubscribeTopics();

  const publicTopics = unsubscribeTopics.filter(
    (topic) => topic.visibility === UnsubscribeTopicVisibility.PUBLIC,
  );

  return (
    <Section>
      <H2Title
        title={t`Unsubscribe page`}
        description={t`Preview of the page recipients see when they unsubscribe`}
      />
      <StyledViewport>
        <StyledCard rounded>
          <StyledHeader>
            <H2Title
              title={t`Do you want to unsubscribe?`}
              description={t`Confirm your preferences:`}
            />
          </StyledHeader>
          <StyledTopics>
            {publicTopics.map((topic) => (
              <StyledTopicRow key={topic.id}>
                <Checkbox
                  checked
                  onChange={() => {}}
                  aria-label={topic.name ?? t`Untitled topic`}
                />
                {topic.name ?? t`Untitled topic`}
              </StyledTopicRow>
            ))}
          </StyledTopics>
          <Button
            title={t`Update`}
            variant="primary"
            accent="blue"
            fullWidth
            justify="center"
          />
          <HorizontalSeparator text={t`Or`} noMargin />
          <Button
            title={t`Unsubscribe all`}
            variant="secondary"
            fullWidth
            justify="center"
          />
        </StyledCard>
      </StyledViewport>
    </Section>
  );
};
