import { Tooltip } from 'react-tooltip';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { v4 as uuidV4 } from 'uuid';

import { Avatar } from '@/users/components/Avatar';
import {
  beautifyExactDate,
  beautifyPastDateRelativeToNow,
} from '@/utils/datetime/date-utils';

const StyledShowPageSummaryCard = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(3)}
    ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3)};
`;

const StyledInfoContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledDate = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledTooltip = styled(Tooltip)`
  background-color: ${({ theme }) => theme.background.primary};
  box-shadow: ${({ theme }) => theme.boxShadow.light};

  color: ${({ theme }) => theme.font.color.primary};

  padding: ${({ theme }) => theme.spacing(2)};
`;

export function ShowPageSummaryCard({
  logoOrAvatar,
  title,
  date,
}: {
  logoOrAvatar?: string;
  title: string;
  date: string;
}) {
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(date);
  const exactCreatedAt = beautifyExactDate(date);
  const theme = useTheme();
  const dateElementId = `date-id-${uuidV4()}`;

  return (
    <StyledShowPageSummaryCard>
      <Avatar
        avatarUrl={logoOrAvatar}
        size={theme.icon.size.xl}
        placeholder={title}
      />
      <StyledInfoContainer>
        <StyledTitle>{title}</StyledTitle>
        <StyledDate id={dateElementId}>
          Added {beautifiedCreatedAt} ago
        </StyledDate>
        <StyledTooltip
          anchorSelect={`#${dateElementId}`}
          content={exactCreatedAt}
          clickable
          noArrow
          place="right"
        />
      </StyledInfoContainer>
    </StyledShowPageSummaryCard>
  );
}
