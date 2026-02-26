import { createRequire as __createRequire } from 'module';
const require = __createRequire(import.meta.url);

// src/logic-functions/get-verify-page.ts
import { defineLogicFunction } from "twenty-sdk";
var VERIFY_PAGE_PATH = "/oauth/verify";
var renderSuccessPage = (tokens) => {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Apollo OAuth - Success</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    .success { color: #10b981; }
    .token-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0; word-break: break-all; }
    .label { font-weight: 600; color: #374151; }
    h1 { color: #111827; }
  </style>
</head>
<body>
  <h1 class="success">\u2713 Apollo Connected Successfully</h1>
  <p>Your Apollo account has been connected. You can close this window.</p>

  <div class="token-box">
    <p class="label">Access Token:</p>
    <code>${tokens.access_token}</code>
  </div>

  <div class="token-box">
    <p class="label">Refresh Token:</p>
    <code>${tokens.refresh_token}</code>
  </div>

  <div class="token-box">
    <p class="label">Expires In:</p>
    <code>${tokens.expires_in} seconds (${Math.round(tokens.expires_in / 86400)} days)</code>
  </div>

  <div class="token-box">
    <p class="label">Scopes:</p>
    <code>${tokens.scope}</code>
  </div>
</body>
</html>`;
};
var renderErrorPage = (error) => {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Apollo OAuth - Error</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    .error { color: #ef4444; }
    .error-box { background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca; }
    h1 { color: #111827; }
  </style>
</head>
<body>
  <h1 class="error">\u2717 Connection Failed</h1>
  <div class="error-box">
    <p>${error}</p>
    <p>${process.env.TWENTY_API_URL}</p>
  </div>
</body>
</html>`;
};
var handler = async (event) => {
  const code = event.queryStringParameters?.code;
  if (!code) {
    return renderErrorPage("Authorization code is missing. Please try connecting again.");
  }
  const baseUrl = "http://apple.localhost:3000";
  try {
    const response = await fetch(
      `${baseUrl}/s/oauth/token-pairs?code=${encodeURIComponent(code)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      return renderErrorPage(`Failed to get tokens: ${response.status} - ${errorText}`);
    }
    const tokens = await response.json();
    return renderSuccessPage(tokens);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return renderErrorPage(errorMessage);
  }
};
var get_verify_page_default = defineLogicFunction({
  universalIdentifier: "4d74950a-d9c1-4c66-a799-89c1aea4e6b0",
  name: "get-verify-page",
  description: "Returns the Apollo OAuth verify page",
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: VERIFY_PAGE_PATH,
    httpMethod: "GET",
    isAuthRequired: false
  }
});
export {
  VERIFY_PAGE_PATH,
  get_verify_page_default as default
};
//# sourceMappingURL=get-verify-page.mjs.map
