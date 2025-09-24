import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import { GraphTypeInfo } from '@/command-menu/pages/page-layout/components/GraphTypeInfo';
import { GraphType } from '@/page-layout/mocks/mockWidgets';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const CommandMenuPageLayoutGraphTypeSelect = () => {
  const [currentGraphType, setCurrentGraphType] = useState(GraphType.BAR);
  const theme = useTheme();

  return (
    <>
      <SidePanelHeader
        Icon={GraphTypeInfo[currentGraphType].icon}
        iconColor={theme.font.color.tertiary}
        initialTitle="Chart"
        headerType={GraphTypeInfo[currentGraphType].label}
        onTitleChange={() => {}}
      />
      <StyledContainer>
        <ChartTypeSelectionSection
          currentGraphType={currentGraphType}
          setCurrentGraphType={setCurrentGraphType}
        />
      </StyledContainer>
    </>
  );
};
