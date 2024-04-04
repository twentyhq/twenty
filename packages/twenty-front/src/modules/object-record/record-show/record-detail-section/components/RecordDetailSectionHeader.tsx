import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';

const StyledHeader = styled.header<{ isDropdownOpen?: boolean }>`
  align-items: center;
  display: flex;
  height: 24px;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
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
};

export const RecordDetailSectionHeader = ({
  title,
  link,
  rightAdornment,
  hideRightAdornmentOnMouseLeave = true,
}: RecordDetailSectionHeaderProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <StyledHeader
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledTitle>
        <StyledTitleLabel>{title}</StyledTitleLabel>
        {link && <StyledLink to={link.to}>{link.label}</StyledLink>}
      </StyledTitle>
      {hideRightAdornmentOnMouseLeave && !isHovered ? null : rightAdornment}
    </StyledHeader>
  );
};
