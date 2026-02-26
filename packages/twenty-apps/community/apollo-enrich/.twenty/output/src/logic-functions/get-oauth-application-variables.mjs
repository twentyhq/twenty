import { createRequire as __createRequire } from 'module';
const require = __createRequire(import.meta.url);

// src/logic-functions/get-oauth-application-variables.ts
import { defineLogicFunction } from "twenty-sdk";
var handler = async () => {
  const apolloClientId = process.env.APOLLO_CLIENT_ID ?? "";
  const apolloRegisteredUrl = process.env.APOLLO_REGISTERED_URL ?? "";
  const apolloOAuthUrl = process.env.APOLLO_OAUTH_URL ?? "";
  return { apolloClientId, apolloRegisteredUrl, apolloOAuthUrl };
};
var get_oauth_application_variables_default = defineLogicFunction({
  universalIdentifier: "b7c3e8f1-9d4a-4e2b-8f6c-1a5d3e7b9c2f",
  name: "get-oauth-application-variables",
  description: "Returns the Apollo OAuth authorization URL",
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: "/oauth/application-variables",
    httpMethod: "GET",
    isAuthRequired: false
  }
});
export {
  get_oauth_application_variables_default as default
};
//# sourceMappingURL=get-oauth-application-variables.mjs.map
