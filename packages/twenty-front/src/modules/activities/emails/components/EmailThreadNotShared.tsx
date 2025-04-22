import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AppTooltip, IconLock, TooltipDelay } from 'twenty-ui/display';
import { MessageChannelVisibility } from '~/generated/graphql';

const StyledContainer = styled.div<{ isCompact?: boolean }>`
  align-items: center;
  display: flex;
  flex: ${({ isCompact }) => (isCompact ? '0 0 auto' : '1 0 0')};
  gap: ${({ theme }) => theme.spacing(1)};
  height: 20px;
  margin-left: auto;
  width: ${({ isCompact }) => (isCompact ? 'auto' : '100%')};
  min-width: ${({ theme }) =>
    `calc(${theme.icon.size.md} + ${theme.spacing(2)})`};
  padding: ${({ theme }) => theme.spacing(0, 1)};

  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  background: ${({ theme }) => theme.background.transparent.lighter};

  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

type EmailThreadNotSharedProps = {
  visibility: MessageChannelVisibility;
};

export const EmailThreadNotShared = ({
  visibility,
}: EmailThreadNotSharedProps) => {
  const theme = useTheme();
  const containerId = 'email-thread-not-shared';
  const isCompact = visibility === MessageChannelVisibility.SUBJECT;

  return (
    <>
      <StyledContainer id={containerId} isCompact={isCompact}>
        <IconLock size={theme.icon.size.md} />
        {visibility === MessageChannelVisibility.METADATA && 'Not shared'}
      </StyledContainer>
      {visibility === MessageChannelVisibility.SUBJECT && (
        <AppTooltip
          anchorSelect={`#${containerId}`}
          content="Only the subject is shared"
          delay={TooltipDelay.mediumDelay}
          noArrow
          place="bottom"
          positionStrategy="fixed"
        />
      )}
    </>
  );
};
