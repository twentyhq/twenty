type McpToolAnnotations = {
  readOnlyHint?: boolean | null;
};

export const isMcpToolSafeToTestWithoutConfirmation = ({
  annotations,
}: {
  annotations?: McpToolAnnotations | null;
}): boolean => annotations?.readOnlyHint === true;
