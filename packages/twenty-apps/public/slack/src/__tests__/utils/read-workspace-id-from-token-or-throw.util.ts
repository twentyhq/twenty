export const readWorkspaceIdFromTokenOrThrow = (token: string): string => {
  const payload = ((): { workspaceId?: string } => {
    try {
      return JSON.parse(
        Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'),
      );
    } catch (error) {
      throw new Error(
        `TWENTY_API_KEY is not a readable JWT: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  })();

  if (payload.workspaceId === undefined) {
    throw new Error('TWENTY_API_KEY carries no workspaceId claim');
  }

  return payload.workspaceId;
};
