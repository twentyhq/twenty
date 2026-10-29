import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  useState,
} from 'react';
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
  const [width, setWidth] = useState(0);

  const measureHeaderWidth = (handleElement: HTMLElement) => {
    const headerElement = handleElement.closest<HTMLElement>(
      '[data-table-header]',
    );

    if (isDefined(headerElement)) {
      setWidth(headerElement.offsetWidth);
    }
  };

  const measureWidth = (
    event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>,
  ) => measureHeaderWidth(event.currentTarget);

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    const handleElement = event.currentTarget;

    onWidthReset();
    requestAnimationFrame(() => measureHeaderWidth(handleElement));
  };

  const handleValueChange = (nextWidth: number) => {
    setWidth(nextWidth);
    onWidthPreview(nextWidth);
  };

  const label = t(column.label);

  return (
    <StyledTableHeader align={column.align}>
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
          onDoubleClick={handleDoubleClick}
          aria-label={t`Resize ${label} column`}
          scale={getUiZoom}
        >
          <StyledResizeHandleBar />
        </ResizeHandle>
      </StyledResizeHandleContainer>
    </StyledTableHeader>
  );
};
