import styled from '@emotion/styled';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const StyledHeader = styled.header<{
  isDropdownOpen?: boolean;
  areRecordsAvailable?: boolean;
}>`
  align-items: center;
  justify-content: space-between;
  display: flex;
  height: 24px;
  margin-bottom: ${({ theme, areRecordsAvailable }) =>
    areRecordsAvailable && theme.spacing(2)};
`;

const StyledTitle = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitleLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.font.color.light};
  text-decoration: none;
  font-size: ${({ theme }) => theme.font.size.sm};

  :hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

type RecordDetailSectionHeaderProps = {
  title: string;
  link?: { to: string; label: string };
  rightAdornment?: React.ReactNode;
  hideRightAdornmentOnMouseLeave?: boolean;
  areRecordsAvailable?: boolean;
};

export const RecordDetailSectionHeader = ({
  title,
  link,
  rightAdornment,
  hideRightAdornmentOnMouseLeave = true,
  areRecordsAvailable = false,
}: RecordDetailSectionHeaderProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <StyledHeader
      areRecordsAvailable={areRecordsAvailable}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledTitle>
        <StyledTitleLabel>{title}</StyledTitleLabel>
        {link && <StyledLink to={link.to}>{link.label}</StyledLink>}
      </StyledTitle>
      {hideRightAdornmentOnMouseLeave && !isHovered && areRecordsAvailable
        ? null
        : rightAdornment}
    </StyledHeader>
  );
};
