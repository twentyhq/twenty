import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components';
import { IconLock } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { THEME_COMMON } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Toggle } from 'src/front-components/components/Toggle';
import { useSlackAccessMode } from 'src/front-components/hooks/use-slack-access-mode';
import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';

const StyledCardContent = styled.div<{ $disabled: boolean }>`
  align-items: center;
  background-color: ${() => themeCssVariables.background.secondary};
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  display: flex;
  gap: ${() => themeCssVariables.spacing[3]};
  padding: ${() => themeCssVariables.spacing[4]};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  position: relative;

  &:hover {
    background: ${() => themeCssVariables.background.transparent.lighter};
  }
`;

const StyledIcon = styled.div`
  align-items: center;
  background-color: ${() => themeCssVariables.background.primary};
  border: 2px solid ${() => themeCssVariables.border.color.light};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.secondary};
  display: flex;
  height: ${() => themeCssVariables.spacing[8]};
  justify-content: center;
  min-width: ${() => themeCssVariables.spacing[8]};
  width: ${() => themeCssVariables.spacing[8]};
`;

const StyledTextContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledTitle = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin-bottom: ${() => themeCssVariables.spacing[1]};
`;

const StyledDescription = styled.div`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  line-height: ${() => themeCssVariables.text.lineHeight.lg};
  overflow-wrap: break-word;
`;

const StyledCover = styled.span`
  cursor: pointer;
  inset: 0;
  position: absolute;
`;

const StyledToggleContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
`;

const RESTRICTED_DESCRIPTION =
  'Only Slack accounts linked to a workspace member can use it.';

const OPEN_DESCRIPTION =
  'Anyone who can mention the assistant in Slack can use it.';

const UNREADABLE_DESCRIPTION =
  'The current setting could not be loaded. Reload to try again.';

const getDescription = ({
  hasAccessModeError,
  isRestricted,
}: {
  hasAccessModeError: boolean;
  isRestricted: boolean;
}): string => {
  if (hasAccessModeError) {
    return UNREADABLE_DESCRIPTION;
  }

  return isRestricted ? RESTRICTED_DESCRIPTION : OPEN_DESCRIPTION;
};

type SlackAccessModeSectionProps = {
  canManage: boolean;
};

export const SlackAccessModeSection = ({
  canManage,
}: SlackAccessModeSectionProps) => {
  const toggleId = useId();
  const {
    accessMode,
    hasAccessModeError,
    isAccessModeLoading,
    isSavingAccessMode,
    saveAccessMode,
  } = useSlackAccessMode();

  const isRestricted = accessMode === SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS;

  const isDisabled =
    !canManage ||
    hasAccessModeError ||
    isAccessModeLoading ||
    isSavingAccessMode;

  const handleToggle = async (value: boolean) => {
    const result = await saveAccessMode(
      value ? SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS : SLACK_ACCESS_MODE.ANYONE,
    );

    enqueueSnackbar({
      message: isNonEmptyString(result.error) ? result.error : result.message,
      variant: result.success ? 'success' : 'error',
    });
  };

  const description = getDescription({ hasAccessModeError, isRestricted });

  return (
    <Section.Root>
      <Section.Header
        title="Access"
        description="Choose who the assistant answers in Slack."
      />
      <Card rounded>
        <StyledCardContent $disabled={isDisabled}>
          <StyledIcon>
            <IconLock size={THEME_COMMON.icon.size.md} />
          </StyledIcon>
          <StyledTextContainer>
            <StyledTitle>
              <label htmlFor={toggleId}>
                Restrict to linked members
                <StyledCover />
              </label>
            </StyledTitle>
            <StyledDescription>{description}</StyledDescription>
          </StyledTextContainer>
          <StyledToggleContainer>
            <Toggle
              id={toggleId}
              checked={isRestricted}
              onChange={handleToggle}
              disabled={isDisabled}
              ariaLabel="Restrict the assistant to linked members"
            />
          </StyledToggleContainer>
        </StyledCardContent>
      </Card>
    </Section.Root>
  );
};
