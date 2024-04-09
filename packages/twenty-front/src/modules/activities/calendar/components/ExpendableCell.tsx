export const ExpendableCell = ({ children, isExpanded }) => {
  return (
    <div style={{ display: isExpanded ? 'block' : 'none' }}>{children}</div>
  );
};
