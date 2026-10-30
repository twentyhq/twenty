import styled from '@emotion/styled';
import { Fragment } from 'react';
import { t, useTranslate } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { Separator } from 'src/front-components/components/Separator';
import {
  StyledSettingsCardDescription,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

type LinkedinPersonReviewItem = Extract<
  LinkedinSettingsView,
  { isConnected: true }
>['personReviews'][number];

const StyledReviewRow = styled.div`
  background-color: ${() => themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[3]};
  padding: ${() => themeCssVariables.spacing[4]};
`;

const StyledParticipant = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[3]};
`;

const StyledChoices = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${() => themeCssVariables.spacing[2]};
  padding-left: ${() => themeCssVariables.spacing[11]};
`;

type LinkedinPersonReviewSectionProps = {
  personReviews: LinkedinPersonReviewItem[];
  resolvingHandle: string | undefined;
  onResolve: (input: { handle: string; personId?: string }) => void;
};

export const LinkedinPersonReviewSection = ({
  personReviews,
  resolvingHandle,
  onResolve,
}: LinkedinPersonReviewSectionProps) => {
  const { locale } = useTranslate();

  return (
    <Section.Root>
      <Section.Header
        title={t('People to review')}
        description={t(
          'These participants share their name with several People and no LinkedIn profile link matches. Pick the right person or create a new one; their messages are linked right away.',
        )}
      />
      <StyledSettingsCard>
        {personReviews.map((personReview, index) => {
          const isResolving = resolvingHandle === personReview.handle;
          const isDisabled = resolvingHandle !== undefined;

          return (
            <Fragment key={personReview.handle}>
              <StyledReviewRow aria-busy={isResolving}>
                <StyledParticipant>
                  <Avatar
                    name={personReview.displayName}
                    colorSeed={personReview.handle}
                    size="lg"
                    shape="circle"
                  />
                  <StyledSettingsCardTextContainer>
                    <StyledSettingsCardTitle>
                      {personReview.displayName}
                    </StyledSettingsCardTitle>
                    <StyledSettingsCardDescription>
                      {t('{handle} · last message {date}', {
                        handle: personReview.handle,
                        date: new Date(
                          personReview.lastMessageAt,
                        ).toLocaleDateString(locale, { dateStyle: 'medium' }),
                      })}
                    </StyledSettingsCardDescription>
                  </StyledSettingsCardTextContainer>
                </StyledParticipant>
                <StyledChoices>
                  {personReview.candidates.map((candidate) => (
                    <Button
                      key={candidate.id}
                      size="sm"
                      variant="outline"
                      disabled={isDisabled}
                      onClick={() =>
                        onResolve({
                          handle: personReview.handle,
                          personId: candidate.id,
                        })
                      }
                    >
                      {candidate.companyName === null
                        ? candidate.name
                        : t('{name} · {companyName}', {
                            name: candidate.name,
                            companyName: candidate.companyName,
                          })}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    startIcon={<IconPlus size={14} />}
                    disabled={isDisabled}
                    loading={isResolving}
                    onClick={() => onResolve({ handle: personReview.handle })}
                  >
                    {t('Create a new person')}
                  </Button>
                </StyledChoices>
              </StyledReviewRow>
              {index < personReviews.length - 1 && <Separator />}
            </Fragment>
          );
        })}
      </StyledSettingsCard>
    </Section.Root>
  );
};
