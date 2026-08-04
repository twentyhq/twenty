import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';

import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAdminChatCollapsibleSectionProps = {
  label: string;
  defaultExpanded?: boolean;
  children: ReactNode;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledToggleButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  padding: 0;
  width: fit-content;
`;

export const SettingsAdminChatCollapsibleSection = ({
  label,
  defaultExpanded = false,
  children,
}: SettingsAdminChatCollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <StyledContainer>
      <StyledToggleButton
        onClick={() =>
          setIsExpanded((previousIsExpanded) => !previousIsExpanded)
        }
      >
        {label}
        {isExpanded ? (
          <IconChevronUp size={14} />
        ) : (
          <IconChevronDown size={14} />
        )}
      </StyledToggleButton>
      <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
        {children}
      </AnimatedExpandableContainer>
    </StyledContainer>
  );
};
