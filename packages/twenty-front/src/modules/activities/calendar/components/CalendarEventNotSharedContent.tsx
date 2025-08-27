import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/display';
import { Card, CardContent } from 'twenty-ui/layout';

const StyledVisibilityCard = styled(Card)`
  border-color: ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.light};
  flex: 1;
  transition: color ${({ theme }) => theme.animation.duration.normal} ease;
  width: 100%;
`;

const StyledVisibilityCardContent = styled(CardContent)`
  align-items: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0, 1)};
  height: ${({ theme }) => theme.spacing(6)};
  background-color: ${({ theme }) => theme.background.transparent.lighter};
`;

export const CalendarEventNotSharedContent = () => {
  const theme = useTheme();

  return (
    <StyledVisibilityCard>
      <StyledVisibilityCardContent>
        <IconLock size={theme.icon.size.sm} />
        <Trans>Not shared</Trans>
      </StyledVisibilityCardContent>
    </StyledVisibilityCard>
  );
};
