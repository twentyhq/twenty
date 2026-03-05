import { styled } from '@linaria/react';
import React from 'react';
import { Label } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledGroupHeading = styled(Label)`
  align-items: center;
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[2]};
  user-select: none;
`;

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
`;

type SidePanelGroupProps = {
  heading: string;
  children: React.ReactNode | React.ReactNode[];
};

export const SidePanelGroup = ({ heading, children }: SidePanelGroupProps) => {
  if (!children || !React.Children.count(children)) {
    return null;
  }
  return (
    <>
      <StyledGroupHeading>{heading}</StyledGroupHeading>
      <StyledGroup>{children}</StyledGroup>
    </>
  );
};
