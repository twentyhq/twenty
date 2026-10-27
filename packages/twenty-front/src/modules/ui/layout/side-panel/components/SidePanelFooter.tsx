import { SidePanelFooterWidthContext } from '@/ui/layout/side-panel/contexts/SidePanelFooterWidthContext';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { styled } from '@linaria/react';
import { Fragment, useCallback, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  bottom: 0;
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  width: 100%;

  &[data-variant='compact'] {
    align-items: center;
    backdrop-filter: blur(${themeCssVariables.spacing[5]});
    background: ${themeCssVariables.background.transparent.primary};
    border-top-color: ${themeCssVariables.border.color.medium};
    display: flex;
    flex-shrink: 0;
    height: ${themeCssVariables.spacing[10]};
    padding: ${themeCssVariables.spacing[2]};
  }
`;

const StyledActionsRow = styled(NodeDimension)`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  width: 100%;
`;

type SidePanelFooterProps = {
  actions: React.ReactNode[];
  variant?: 'default' | 'compact';
};

export const SidePanelFooter = ({
  actions,
  variant = 'default',
}: SidePanelFooterProps) => {
  const [actionsRowWidth, setActionsRowWidth] = useState(0);

  const handleActionsRowDimensionChange = useCallback(
    (dimensions: { width: number; height: number }) => {
      setActionsRowWidth(dimensions.width);
    },
    [],
  );

  return (
    <StyledContainer data-variant={variant}>
      <SidePanelFooterWidthContext.Provider value={actionsRowWidth}>
        <StyledActionsRow onDimensionChange={handleActionsRowDimensionChange}>
          {actions.map((action, index) => (
            <Fragment key={index}>{action}</Fragment>
          ))}
        </StyledActionsRow>
      </SidePanelFooterWidthContext.Provider>
    </StyledContainer>
  );
};
