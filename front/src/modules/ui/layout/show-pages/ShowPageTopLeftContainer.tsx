import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';

import {
  beautifyExactDate,
  beautifyPastDateRelativeToNow,
} from '@/utils/datetime/date-utils';

const StyledShowTopLeftImageContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(3)}
    ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3)};
`;

const StyledShowTopLeftImageInsideContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 12px;

  img {
    border-radius: 4px;
    height: 40px;
    width: 40px;
  }

  div {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

const StyledDate = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledTooltip = styled(Tooltip)`
  background-color: ${({ theme }) => theme.background.primary};

  box-shadow: 0px 2px 4px 3px
    ${({ theme }) => theme.background.transparent.light};

  box-shadow: 2px 4px 16px 6px
    ${({ theme }) => theme.background.transparent.light};

  color: ${({ theme }) => theme.font.color.primary};

  opacity: 1;
  padding: 8px;
`;

export function ShowPageTopLeftContainer({
  logoOrAvatar,
  title,
  date,
}: {
  logoOrAvatar: string;
  title: string;
  date: string;
}) {
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(date);
  const exactCreatedAt = beautifyExactDate(date);

  return (
    <StyledShowTopLeftImageContainer>
      <StyledShowTopLeftImageInsideContainer>
        <img src={logoOrAvatar} alt="Logo or Avatar" />
        <div>
          <StyledTitle>{title}</StyledTitle>
          <StyledDate id={`id-${title}`}>
            Added {beautifiedCreatedAt} ago
          </StyledDate>
          <StyledTooltip
            anchorSelect={`#id-${title}`}
            content={exactCreatedAt}
            clickable
            noArrow
          />
        </div>
      </StyledShowTopLeftImageInsideContainer>
    </StyledShowTopLeftImageContainer>
  );
}
