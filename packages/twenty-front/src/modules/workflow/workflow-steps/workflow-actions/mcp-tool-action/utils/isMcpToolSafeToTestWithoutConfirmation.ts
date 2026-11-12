type McpToolAnnotations = {
  readOnlyHint?: boolean | null;
  destructiveHint?: boolean | null;
};

export const isMcpToolSafeToTestWithoutConfirmation = ({
  annotations,
}: {
  annotations?: McpToolAnnotations | null;
}): boolean =>
  annotations?.readOnlyHint === true || annotations?.destructiveHint === false;
