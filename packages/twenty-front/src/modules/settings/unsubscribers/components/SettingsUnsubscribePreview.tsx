import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { Section } from 'twenty-ui/components';
import { Button, Checkbox } from 'twenty-ui/primitives/input';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
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

const StyledCard = styled(Card.Root)`
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
  const { unsubscribeTopics, loading } = useUnsubscribeTopics();

  const publicTopics = unsubscribeTopics.filter(
    (topic) => topic.visibility === UnsubscribeTopicVisibility.PUBLIC,
  );

  const hasPublicTopics = publicTopics.length > 0;

  return (
    <Section.Root>
      <Section.Header
        title={t`Unsubscribe page`}
        description={
          hasPublicTopics
            ? t`Preview of the page recipients see when they unsubscribe`
            : t`Recipients can only unsubscribe from everything. Add a public topic to let them choose what they keep receiving.`
        }
      />
      <StyledViewport>
        {!loading && (
          <StyledCard rounded>
            <StyledHeader>
              <Section.Header
                title={t`Do you want to unsubscribe?`}
                description={
                  hasPublicTopics
                    ? t`Confirm your preferences:`
                    : t`You will stop receiving these emails.`
                }
              />
            </StyledHeader>
            {hasPublicTopics ? (
              <>
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
                <Button
                  fullWidth
                  variant="solid"
                  color="accent"
                >{t`Update`}</Button>
                <HorizontalSeparator text={t`Or`} noMargin />
                <Button
                  fullWidth
                  variant="outline"
                >{t`Unsubscribe all`}</Button>
              </>
            ) : (
              <Button
                fullWidth
                variant="solid"
                color="accent"
              >{t`Unsubscribe`}</Button>
            )}
          </StyledCard>
        )}
      </StyledViewport>
    </Section.Root>
  );
};
