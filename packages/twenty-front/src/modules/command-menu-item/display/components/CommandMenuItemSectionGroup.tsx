import { styled } from '@linaria/react';
import React, { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeading = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[5]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[1]};
  user-select: none;
`;

const StyledHeadingLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.medium};
  white-space: nowrap;
`;

const StyledHeadingRule = styled.div`
  background: ${themeCssVariables.border.color.medium};
  flex: 1;
  height: 1px;
`;

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
`;

type CommandMenuItemSectionGroupProps = {
  heading: string;
  context?: ReactNode;
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
        <StyledHeadingLabel>{heading}</StyledHeadingLabel>
        <StyledHeadingRule />
        {context}
      </StyledHeading>
      <StyledGroup>{children}</StyledGroup>
    </>
  );
};
