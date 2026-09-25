import { styled } from '@linaria/react';
import { type Ref } from 'react';
import { createPortal } from 'react-dom';
import { type IconComponent, IconPlus } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledDragPreview = styled.div`
  align-items: center;
  backdrop-filter: ${themeCssVariables.blur.strong};
  background-color: ${themeCssVariables.tooltip.background};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.tooltip.color};
  display: inline-flex;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  left: -10000px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  pointer-events: none;
  position: fixed;
  top: 0;
  white-space: nowrap;

  &[data-insertion='true'] {
    padding-left: ${themeCssVariables.spacing[1]};
  }
`;

const StyledInsertionBadge = styled.span`
  align-items: center;
  background-color: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.rounded};
  display: inline-flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

type AdvancedTextEditorDragPreviewProps = {
  Icon: IconComponent;
  label: string;
  isInsertion: boolean;
  ref: Ref<HTMLDivElement>;
};

export const AdvancedTextEditorDragPreview = ({
  Icon,
  label,
  isInsertion,
  ref,
}: AdvancedTextEditorDragPreviewProps) => {
  const theme = useTheme();

  return createPortal(
    <StyledDragPreview
      ref={ref}
      aria-hidden
      data-insertion={String(isInsertion)}
    >
      {isInsertion && (
        <StyledInsertionBadge>
          <IconPlus size={10} stroke={theme.icon.stroke.lg} />
        </StyledInsertionBadge>
      )}
      <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      {label}
    </StyledDragPreview>,
    document.body,
  );
};
