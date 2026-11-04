import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

type SidePanelShareRecordListProps = {
  children: ReactNode;
};

export const SidePanelShareRecordList = ({
  children,
}: SidePanelShareRecordListProps) => (
  <ScrollWrapper componentInstanceId="scroll-wrapper-side-panel">
    <StyledList>{children}</StyledList>
  </ScrollWrapper>
);
