import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledGroupHeading = styled.label`
  color: ${themeCssVariables.color.gray10};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[4]};
`;

type KeyboardMenuGroupProps = {
  heading: string;
  children: React.ReactNode | React.ReactNode[];
};

export const KeyboardMenuGroup = ({
  heading,
  children,
}: KeyboardMenuGroupProps) => {
  return (
    <StyledGroup>
      <StyledGroupHeading>{heading}</StyledGroupHeading>
      {children}
    </StyledGroup>
  );
};
