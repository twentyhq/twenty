import { AdvancedFilterSidePanelColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelColumn';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

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
  <AdvancedFilterSidePanelColumn>
    <StyledHeader>
      {header}
      {menu}
    </StyledHeader>
    {children}
  </AdvancedFilterSidePanelColumn>
);
