type McpToolAnnotations = {
  readOnlyHint?: boolean | null;
  destructiveHint?: boolean | null;
};

export const isMcpToolSafeToTestWithoutConfirmation = ({
  annotations,
}: {
  annotations?: McpToolAnnotations | null;
}): boolean =>
  Boolean(annotations?.readOnlyHint) || annotations?.destructiveHint === false;
