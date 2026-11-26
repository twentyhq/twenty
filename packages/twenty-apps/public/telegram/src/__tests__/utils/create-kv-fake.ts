export const createKvFake = () => {
  const serverClaims = new Map<string, string>();
  const workspaceValues = new Map<string, unknown>();
  const state = { workspaceId: 'workspace-1' };

  const workspaceKey = (key: string) => `${state.workspaceId}:${key}`;

  return {
    serverClaims,
    workspaceValues,
    actAsWorkspace: (workspaceId: string) => {
      state.workspaceId = workspaceId;
    },
    kv: {
      get: async (key: string, options?: { scope?: string }) =>
        (options?.scope === 'SERVER'
          ? serverClaims.get(key)
          : workspaceValues.get(workspaceKey(key))) ?? null,
      set: async (
        key: string,
        value: unknown,
        options?: { scope?: string },
      ) => {
        if (options?.scope !== 'SERVER') {
          workspaceValues.set(workspaceKey(key), value);

          return;
        }

        const claimingWorkspaceId = serverClaims.get(key) ?? state.workspaceId;

        if (claimingWorkspaceId !== state.workspaceId) {
          throw new Error(
            `Server key "${key}" is already claimed by another workspace`,
          );
        }

        serverClaims.set(key, state.workspaceId);
      },
      delete: async (key: string, options?: { scope?: string }) => {
        if (options?.scope !== 'SERVER') {
          return workspaceValues.delete(workspaceKey(key));
        }

        return (
          serverClaims.get(key) === state.workspaceId &&
          serverClaims.delete(key)
        );
      },
    },
  };
};
