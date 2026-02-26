import { createRequire as __createRequire } from 'module';
const require = __createRequire(import.meta.url);

// src/logic-functions/post-install.ts
import { definePostInstallLogicFunction } from "twenty-sdk";
var handler = async (payload) => {
  console.log("Post install logic function executed successfully!", payload.previousVersion);
};
var post_install_default = definePostInstallLogicFunction({
  universalIdentifier: "08292efc-d7ba-4ec3-ab95-e7c33bd3a3bc",
  name: "post-install",
  description: "Runs after installation to set up the application.",
  timeoutSeconds: 300,
  handler
});
export {
  post_install_default as default
};
//# sourceMappingURL=post-install.mjs.map
