import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconChevronDown } from 'twenty-ui/display';
import { AnimatedExpandableContainer, Section } from 'twenty-ui/layout';

const StyledHeader = styled.header`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: space-between;
`;

const StyledTitleLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledChevronIcon = styled(IconChevronDown)<{ isExpanded: boolean }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  transform: ${({ isExpanded }) =>
    isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: ${({ theme }) =>
    `transform ${theme.animation.duration.normal}s ease`};
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
    <Section>
      <StyledHeader onClick={handleToggleSection}>
        <StyledTitleLabel>{title}</StyledTitleLabel>
        <StyledChevronIcon
          isExpanded={isExpanded}
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </StyledHeader>
      <AnimatedExpandableContainer
        isExpanded={isExpanded}
        initial={false}
        mode="fit-content"
      >
        {children}
      </AnimatedExpandableContainer>
    </Section>
  );
};
