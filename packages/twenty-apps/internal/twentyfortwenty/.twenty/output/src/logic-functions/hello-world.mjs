import { createRequire as __createRequire } from 'module';
const require = __createRequire(import.meta.url);

// src/logic-functions/hello-world.ts
import { defineLogicFunction } from "twenty-sdk";
var handler = async () => {
  return { message: "Hello, World!" };
};
var hello_world_default = defineLogicFunction({
  universalIdentifier: "ea5b3bbd-a8c3-48ed-880e-a0d062588f53",
  name: "hello-world-logic-function",
  description: "A simple logic function",
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: "/hello-world-logic-function",
    httpMethod: "GET",
    isAuthRequired: false
  }
});
export {
  hello_world_default as default
};
//# sourceMappingURL=hello-world.mjs.map
