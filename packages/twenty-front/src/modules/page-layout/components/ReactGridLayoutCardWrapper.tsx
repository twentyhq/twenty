export const ReactGridLayoutCardWrapper = ({
  children,
  key,
  className,
  style,
  onMouseDown,
  onMouseUp,
  onMouseMove,
}: {
  key: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
  onMouseMove?: React.MouseEventHandler<HTMLDivElement>;
}) => {
  return (
    <div
      key={key}
      data-select-disable="true"
      className={className}
      style={{ ...style, display: 'flex' }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {children}
    </div>
  );
};
