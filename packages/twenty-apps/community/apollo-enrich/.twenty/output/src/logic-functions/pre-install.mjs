import { createRequire as __createRequire } from 'module';
const require = __createRequire(import.meta.url);

// src/logic-functions/pre-install.ts
import { definePreInstallLogicFunction } from "twenty-sdk";
var handler = async (payload) => {
  console.log("Pre install logic function executed successfully!", payload.previousVersion);
};
var pre_install_default = definePreInstallLogicFunction({
  universalIdentifier: "af7cd86e-149e-466a-8d60-312b6e46d604",
  name: "pre-install",
  description: "Runs before installation to prepare the application.",
  timeoutSeconds: 300,
  handler
});
export {
  pre_install_default as default
};
//# sourceMappingURL=pre-install.mjs.map
