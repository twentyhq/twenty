import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import React, { type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { type CommandMenuItemSectionContext } from '@/command-menu-item/types/CommandMenuItemSectionContext';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};

  & + & {
    margin-top: ${themeCssVariables.spacing[3]};
  }
`;

const StyledHeading = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  gap: ${themeCssVariables.spacing['1.5']};
  height: ${themeCssVariables.spacing[8]};
  padding-left: ${themeCssVariables.spacing[1]};
  user-select: none;
`;

const StyledHeadingIcon = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-shrink: 0;
`;

const StyledHeadingText = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Keyboard navigation scrolls the selected command into view, so the first
// command reserves room for its section header above it.
const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};

  & > :first-child {
    scroll-margin-top: ${themeCssVariables.spacing[12]};
  }
`;

type CommandMenuItemSectionGroupProps = {
  heading: string;
  Icon?: IconComponent;
  context?: CommandMenuItemSectionContext;
  children: ReactNode;
};

export const CommandMenuItemSectionGroup = ({
  heading,
  Icon,
  context,
  children,
}: CommandMenuItemSectionGroupProps) => {
  const { theme } = useContext(ThemeContext);

  if (!isDefined(children) || !React.Children.count(children)) {
    return null;
  }

  const contextLabel = context?.label;

  return (
    <StyledSection>
      <StyledHeading>
        {isDefined(context?.icon) ? (
          <StyledHeadingIcon>{context.icon}</StyledHeadingIcon>
        ) : (
          isDefined(Icon) && (
            <StyledHeadingIcon>
              <Icon size={theme.icon.size.sm} />
            </StyledHeadingIcon>
          )
        )}
        <StyledHeadingText>
          {isDefined(contextLabel) ? t`${heading}: ${contextLabel}` : heading}
        </StyledHeadingText>
      </StyledHeading>
      <StyledGroup>{children}</StyledGroup>
    </StyledSection>
  );
};
