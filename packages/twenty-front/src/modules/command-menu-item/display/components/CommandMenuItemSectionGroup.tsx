import { styled } from '@linaria/react';
import React, { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type CommandMenuItemSectionContext } from '@/command-menu-item/types/CommandMenuItemSectionContext';

const StyledHeading = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  gap: ${themeCssVariables.spacing['1.5']};
  margin: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[1]};
  padding-bottom: ${themeCssVariables.spacing['1.5']};
  user-select: none;
`;

const StyledHeadingIcon = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-shrink: 0;
`;

const StyledHeadingText = styled.span`
  align-items: baseline;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  white-space: nowrap;
`;

const StyledHeadingLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledHeadingValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
`;

type CommandMenuItemSectionGroupProps = {
  heading: string;
  context?: CommandMenuItemSectionContext;
  children: ReactNode;
};

export const CommandMenuItemSectionGroup = ({
  heading,
  context,
  children,
}: CommandMenuItemSectionGroupProps) => {
  if (!isDefined(children) || !React.Children.count(children)) {
    return null;
  }

  return (
    <>
      <StyledHeading>
        {isDefined(context?.icon) && (
          <StyledHeadingIcon>{context.icon}</StyledHeadingIcon>
        )}
        <StyledHeadingText>
          {isDefined(context) ? (
            <>
              <StyledHeadingLabel>{heading}:</StyledHeadingLabel>
              <StyledHeadingValue>{context.label}</StyledHeadingValue>
            </>
          ) : (
            <StyledHeadingLabel>{heading}</StyledHeadingLabel>
          )}
        </StyledHeadingText>
      </StyledHeading>
      <StyledGroup>{children}</StyledGroup>
    </>
  );
};
