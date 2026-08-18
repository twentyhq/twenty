import { postToOwnRoute } from "src/logic-functions/requests/post-to-own-route.util";

export const triggerWorkspaceMigration = async () => {
  const continueMigration = await postToOwnRoute();

  if (!continueMigration) {
    throw new Error(
      `Failed to continue migration}`,
    );
  }
};