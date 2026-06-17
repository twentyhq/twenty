import { styled } from '@linaria/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRecordDetailSectionWrapper = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[3]};
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
  margin-bottom: ${({ areRecordsAvailable }) =>
    areRecordsAvailable ? themeCssVariables.spacing[2] : '0'};
  padding-left: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitleLabel = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledLinkContainer = styled.span`
  & > a {
    color: ${themeCssVariables.font.color.light};
    font-size: ${themeCssVariables.font.size.sm};
    text-decoration: none;

    &:hover {
      color: ${themeCssVariables.font.color.secondary};
    }
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
    <StyledRecordDetailSectionWrapper>
      <Section>
        <StyledHeader
          areRecordsAvailable={areRecordsAvailable}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          data-testid={dataTestId}
        >
          <StyledTitle>
            <StyledTitleLabel>{title}</StyledTitleLabel>
            {link && (
              <StyledLinkContainer>
                <Link to={link.to}>{link.label}</Link>
              </StyledLinkContainer>
            )}
          </StyledTitle>
          {hideRightAdornmentOnMouseLeave && !isHovered && areRecordsAvailable
            ? null
            : rightAdornment}
        </StyledHeader>
        {children}
      </Section>
    </StyledRecordDetailSectionWrapper>
  );
};
