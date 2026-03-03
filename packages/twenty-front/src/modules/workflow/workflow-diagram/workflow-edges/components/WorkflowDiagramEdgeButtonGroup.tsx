import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useContext, useMemo, type CSSProperties } from 'react';
import { IconButtonGroup, type IconButtonGroupProps } from 'twenty-ui/input';
import { ThemeContext } from 'twenty-ui/theme';

const iconButtonGroupStyle = css`
  background-color: var(--edge-btn-bg, transparent);
  border: var(--edge-btn-border, none);
  pointer-events: all;
`;

const StyledWrapper = styled.div`
  display: contents;
`;

type WorkflowDiagramEdgeButtonGroupProps = IconButtonGroupProps & {
  selected?: boolean;
};

export const WorkflowDiagramEdgeButtonGroup = ({
  selected = false,
  iconButtons,
}: WorkflowDiagramEdgeButtonGroupProps) => {
  const { theme } = useContext(ThemeContext);

  const dynamicStyles = useMemo(() => {
    if (!selected) return {};
    const colors = getWorkflowDiagramColors({ theme });
    return {
      '--edge-btn-bg': colors.selected.background,
      // eslint-disable-next-line lingui/no-unlocalized-strings
      '--edge-btn-border': `1px solid ${colors.selected.borderColor}`,
    } as CSSProperties;
  }, [selected, theme]);

  return (
    <StyledWrapper style={dynamicStyles}>
      <IconButtonGroup
        className={`nodrag nopan ${iconButtonGroupStyle}`}
        iconButtons={iconButtons}
      />
    </StyledWrapper>
  );
};
