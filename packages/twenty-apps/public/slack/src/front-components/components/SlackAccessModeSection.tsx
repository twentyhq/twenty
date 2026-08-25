import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { useSlackAccessMode } from 'src/front-components/hooks/use-slack-access-mode';
import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
  justify-content: space-between;
`;

const StyledLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

const StyledDescription = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

type SlackAccessModeSectionProps = {
  canManage: boolean;
};

export const SlackAccessModeSection = ({
  canManage,
}: SlackAccessModeSectionProps) => {
  const {
    accessMode,
    isAccessModeLoading,
    isSavingAccessMode,
    saveAccessMode,
  } = useSlackAccessMode();

  const isRestricted = accessMode === SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS;

  const handleToggle = async (value: boolean) => {
    const result = await saveAccessMode(
      value
        ? SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS
        : SLACK_ACCESS_MODE.ANYONE,
    );

    enqueueSnackbar({
      message: isNonEmptyString(result.error) ? result.error : result.message,
      variant: result.success ? 'success' : 'error',
    });
  };

  return (
    <Section>
      <H2Title
        title="Access"
        description="Choose who the assistant answers in Slack."
      />
      <StyledRow>
        <StyledLabel>
          <StyledTitle>Restrict to linked members</StyledTitle>
          <StyledDescription>
            When on, only Slack accounts linked to a workspace member can use
            the assistant. Anyone else is asked to have an admin link them.
          </StyledDescription>
        </StyledLabel>
        <Toggle
          value={isRestricted}
          onChange={handleToggle}
          disabled={!canManage || isAccessModeLoading || isSavingAccessMode}
          aria-label="Restrict the assistant to linked members"
        />
      </StyledRow>
    </Section>
  );
};
