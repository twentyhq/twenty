import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { MessageChannelVisibility } from '~/generated/graphql';

const StyledContainer = styled.div<{ isCompact?: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  flex: ${({ isCompact }) => (isCompact ? '0 0 auto' : '1 0 0')};
  font-size: ${themeCssVariables.font.size.sm};

  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  height: 20px;

  margin-inline-start: auto;
  min-width: ${themeCssVariables.spacing[21]};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[1]};
  width: ${({ isCompact }) => (isCompact ? 'auto' : '100%')};
`;

type EmailThreadNotSharedProps = {
  visibility: MessageChannelVisibility;
};

export const EmailThreadNotShared = ({
  visibility,
}: EmailThreadNotSharedProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const containerId = 'email-thread-not-shared';
  const isCompact = visibility === MessageChannelVisibility.SUBJECT;

  return (
    <Tooltip
      content={t`Only the subject is shared`}
      delay={TooltipDelay.mediumDelay}
      side="bottom"
      positionMethod="fixed"
      disabled={!(visibility === MessageChannelVisibility.SUBJECT)}
    >
      <StyledContainer id={containerId} isCompact={isCompact}>
        <IconLock size={theme.icon.size.sm} />
        {t`Not shared`}
      </StyledContainer>
    </Tooltip>
  );
};
