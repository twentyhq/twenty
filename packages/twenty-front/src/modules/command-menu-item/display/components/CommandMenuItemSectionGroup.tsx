import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import React, { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

  const contextLabel = context?.label;

  return (
    <StyledSection>
      <StyledHeading>
        {isDefined(context?.icon) && (
          <StyledHeadingIcon>{context.icon}</StyledHeadingIcon>
        )}
        <StyledHeadingText>
          {isDefined(contextLabel) ? t`${heading}: ${contextLabel}` : heading}
        </StyledHeadingText>
      </StyledHeading>
      <StyledGroup>{children}</StyledGroup>
    </StyledSection>
  );
};
