import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

type ConditionBuilderRowFrameProps = {
  header: ReactNode;
  menu: ReactNode | null;
  children: ReactNode;
};

export const ConditionBuilderRowFrame = ({
  header,
  menu,
  children,
}: ConditionBuilderRowFrameProps) => (
  <StyledColumn>
    <StyledHeader>
      {header}
      {menu}
    </StyledHeader>
    {children}
  </StyledColumn>
);
