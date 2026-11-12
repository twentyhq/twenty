type McpToolAnnotations = {
  readOnlyHint?: boolean | null;
  destructiveHint?: boolean | null;
};

// Same rule as the server's isDestructiveMcpServerTool
export const isMcpToolSafeToTestWithoutConfirmation = ({
  annotations,
}: {
  annotations?: McpToolAnnotations | null;
}): boolean =>
  annotations?.readOnlyHint === true || annotations?.destructiveHint === false;
