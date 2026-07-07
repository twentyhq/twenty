import { useTheme } from 'twenty-ui/theme-constants';

type FrontComponentErrorBoxProps = {
  error: Error;
};

export const FrontComponentErrorBox = ({
  error,
}: FrontComponentErrorBoxProps) => {
  const theme = useTheme();

  return (
    <div
      style={{
        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
        backgroundColor: theme.background.danger,
        border: `1px solid ${theme.border.color.danger}`,
        borderRadius: theme.border.radius.md,
        color: theme.font.color.danger,
        fontFamily: 'monospace',
        fontSize: theme.font.size.xs,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: '200px',
        overflow: 'auto',
      }}
    >
      <strong>FrontComponent error:</strong> {error.message}
    </div>
  );
};
