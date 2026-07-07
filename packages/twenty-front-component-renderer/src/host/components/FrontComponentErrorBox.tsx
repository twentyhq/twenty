type FrontComponentErrorBoxProps = {
  error: Error;
};

export const FrontComponentErrorBox = ({
  error,
}: FrontComponentErrorBoxProps) => (
  <div
    style={{
      padding: '12px 16px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '6px',
      color: '#991b1b',
      fontFamily: 'monospace',
      fontSize: '13px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      maxHeight: '200px',
      overflow: 'auto',
    }}
  >
    <strong>FrontComponent error:</strong> {error.message}
  </div>
);
