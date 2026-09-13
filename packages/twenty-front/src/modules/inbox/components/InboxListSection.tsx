import { styled } from '@linaria/react';
import { type ReactNode, useContext, useState } from 'react';
import { IconChevronDown } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledSectionToggle = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: 32px;
  padding: 0 6px;
`;

const StyledChevronContainer = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  transform: rotate(${({ isExpanded }) => (isExpanded ? 0 : -90)}deg);
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

type InboxListSectionProps = {
  title: string;
  itemCount: number;
  children: ReactNode;
};

export const InboxListSection = ({
  title,
  itemCount,
  children,
}: InboxListSectionProps) => {
  const { theme } = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <StyledSection>
      <StyledSectionToggle
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
      >
        <StyledChevronContainer isExpanded={isExpanded}>
          <IconChevronDown
            aria-hidden
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
          />
        </StyledChevronContainer>
        {title}
        <StyledCount>{itemCount}</StyledCount>
      </StyledSectionToggle>
      {isExpanded && children}
    </StyledSection>
  );
};
