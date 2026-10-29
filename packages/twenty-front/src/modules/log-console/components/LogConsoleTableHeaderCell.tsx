import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ResizeHandle } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { LOG_CONSOLE_COLUMN_WIDTH_CONSTRAINTS } from '@/log-console/constants/LogConsoleColumnWidthConstraints';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { getUiZoom } from '@/ui/theme/utils/getUiZoom';

const StyledTableHeader = styled(TableHeader)`
  min-width: 0;
  overflow: hidden;
  position: relative;
  white-space: nowrap;
`;

const StyledResizeHandleBar = styled.div`
  align-self: stretch;
  background-color: transparent;
  margin-block: ${themeCssVariables.spacing[2]};
  transition: background-color
    calc(${themeCssVariables.animation.duration.fast} * 1s);
  width: 1px;
`;

const StyledResizeHandleContainer = styled.div`
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  position: absolute;
  right: 0;
  top: 0;

  > [role='separator'] {
    justify-content: flex-end;
  }

  > [role='separator']:is(:hover, :focus-visible, [data-resizing])
  > ${StyledResizeHandleBar} {
    background-color: ${themeCssVariables.border.color.strong};
  }
`;

type LogConsoleTableHeaderCellProps = {
  column: LogConsoleColumn;
  onWidthPreview: (width: number) => void;
  onWidthCommitted: (width: number) => void;
  onWidthReset: () => void;
  onResizeEnd: () => void;
};

export const LogConsoleTableHeaderCell = ({
  column,
  onWidthPreview,
  onWidthCommitted,
  onWidthReset,
  onResizeEnd,
}: LogConsoleTableHeaderCellProps) => {
  const { t } = useLingui();
  const headerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // The handle reads its start value on pointer down, so the rendered width
  // must be known before the gesture begins.
  const measureWidth = () => {
    if (isDefined(headerRef.current)) {
      setWidth(headerRef.current.offsetWidth);
    }
  };

  const handleValueChange = (nextWidth: number) => {
    setWidth(nextWidth);
    onWidthPreview(nextWidth);
  };

  const label = t(column.label);

  return (
    <StyledTableHeader ref={headerRef} align={column.align}>
      {label}
      <StyledResizeHandleContainer>
        <ResizeHandle
          axis="x"
          min={LOG_CONSOLE_COLUMN_WIDTH_CONSTRAINTS.min}
          max={LOG_CONSOLE_COLUMN_WIDTH_CONSTRAINTS.max}
          value={width}
          onValueChange={handleValueChange}
          onValueCommitted={onWidthCommitted}
          onResizeEnd={onResizeEnd}
          onPointerEnter={measureWidth}
          onFocus={measureWidth}
          onDoubleClick={onWidthReset}
          aria-label={t`Resize ${label} column`}
          scale={getUiZoom}
        >
          <StyledResizeHandleBar />
        </ResizeHandle>
      </StyledResizeHandleContainer>
    </StyledTableHeader>
  );
};
