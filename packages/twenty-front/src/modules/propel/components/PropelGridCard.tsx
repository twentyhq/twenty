import { forwardRef, type ReactNode } from 'react';

// Pass-through wrapper react-grid-layout needs around each grid child: it injects
// className/style/onMouse* and a ref to measure + drive drag/resize. Mirrors
// Twenty's ReactGridLayoutCardWrapper. The grid identifies each child by the `key`
// prop set at the call site (React consumes `key`; it is intentionally not read
// here). The actual widget content (a Mantine card) is the child.
export const PropelGridCard = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    style?: React.CSSProperties;
    className?: string;
    onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
    onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
    onMouseMove?: React.MouseEventHandler<HTMLDivElement>;
    onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
  }
>(
  (
    { children, className, style, onMouseDown, onMouseUp, onMouseMove, onTouchEnd },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        data-select-disable="true"
        className={className}
        style={style}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    );
  },
);
