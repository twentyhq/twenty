import './ElipsisDisplay.css';

type EllipsisDisplayV2Props = {
  children: React.ReactNode;
  maxWidth?: number;
};

export const EllipsisDisplayV2 = ({
  children,
  maxWidth,
}: EllipsisDisplayV2Props) => (
  <div className="elipsis-display" style={{ maxWidth: maxWidth ?? '100%' }}>
    {children}
  </div>
);
