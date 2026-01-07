import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { AnimatedExpandableContainer, Section } from 'twenty-ui/layout';

const StyledFieldsWidgetSectionContainer = styled(Section)`
  padding-top: ${({ theme }) => theme.spacing(3)};
  padding-bottom: 0;
  width: auto;

  &:not(:first-of-type) {
    padding-top: 0;
  }
`;

const StyledHeader = styled.header`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: space-between;
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitleLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

type FieldsWidgetSectionContainerProps = {
  children: React.ReactNode;
  title: string;
};

export const FieldsWidgetSectionContainer = ({
  children,
  title,
}: FieldsWidgetSectionContainerProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const theme = useTheme();

  const handleToggleSection = () =>
    setIsExpanded((previousIsExpanded) => !previousIsExpanded);

  return (
    <StyledFieldsWidgetSectionContainer>
      <StyledHeader onClick={handleToggleSection}>
        <StyledTitleLabel>{title}</StyledTitleLabel>
        {isExpanded ? (
          <IconChevronUp
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.tertiary}
          />
        ) : (
          <IconChevronDown
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.tertiary}
          />
        )}
      </StyledHeader>
      <AnimatedExpandableContainer isExpanded={isExpanded}>
        {children}
      </AnimatedExpandableContainer>
    </StyledFieldsWidgetSectionContainer>
  );
};
