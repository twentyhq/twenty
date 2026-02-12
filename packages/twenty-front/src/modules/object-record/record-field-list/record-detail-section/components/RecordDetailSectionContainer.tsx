import styled from '@emotion/styled';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Section } from 'twenty-ui/layout';

const StyledRecordDetailSectionContainer = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  padding-top: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  width: auto;
`;

const StyledHeader = styled.header<{
  isDropdownOpen?: boolean;
  areRecordsAvailable?: boolean;
  ariaLabel?: string;
}>`
  align-items: center;
  display: flex;
  height: 24px;
  justify-content: space-between;
  margin-bottom: ${({ theme, areRecordsAvailable }) =>
    areRecordsAvailable && theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(2)};
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

type RecordDetailSectionContainerProps = {
  children: React.ReactNode;
  title: string;
  link?: { to: string; label: string };
  rightAdornment?: React.ReactNode;
  hideRightAdornmentOnMouseLeave?: boolean;
  areRecordsAvailable?: boolean;
  dataTestId?: string;
};

export const RecordDetailSectionContainer = ({
  children,
  title,
  link,
  rightAdornment,
  hideRightAdornmentOnMouseLeave = true,
  areRecordsAvailable = false,
  dataTestId,
}: RecordDetailSectionContainerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <StyledRecordDetailSectionContainer>
      <StyledHeader
        areRecordsAvailable={areRecordsAvailable}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={dataTestId}
      >
        <StyledTitle>
          <StyledTitleLabel>{title}</StyledTitleLabel>
          {link && <StyledLink to={link.to}>{link.label}</StyledLink>}
        </StyledTitle>
        {hideRightAdornmentOnMouseLeave && !isHovered && areRecordsAvailable
          ? null
          : rightAdornment}
      </StyledHeader>
      {children}
    </StyledRecordDetailSectionContainer>
  );
};
