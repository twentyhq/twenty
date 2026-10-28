import { styled } from '@linaria/react';
import { useState } from 'react';
import { Section } from 'twenty-ui/components/layout';
import { IconChevronDown } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledHeader = styled.header`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: space-between;
`;

const StyledTitleLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledChevronWrapper = styled.div<{ isExpanded: boolean }>`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  transform: ${({ isExpanded }) =>
    isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
`;

type FieldsWidgetGroupContainerProps = {
  children: React.ReactNode;
  title: string;
  defaultExpanded?: boolean;
};

export const FieldsWidgetGroupContainer = ({
  children,
  title,
  defaultExpanded = true,
}: FieldsWidgetGroupContainerProps) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggleGroup = () =>
    setIsExpanded((previousIsExpanded) => !previousIsExpanded);

  return (
    <Section.Root>
      <StyledHeader onClick={handleToggleGroup}>
        <StyledTitleLabel>{title}</StyledTitleLabel>
        <StyledChevronWrapper isExpanded={isExpanded}>
          <IconChevronDown
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        </StyledChevronWrapper>
      </StyledHeader>
      <Collapsible.Root open={isExpanded}>
        <Collapsible.Panel>{children}</Collapsible.Panel>
      </Collapsible.Root>
    </Section.Root>
  );
};
