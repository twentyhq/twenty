import { defineLogicFunction } from "twenty-sdk/define";

export const VERIFY_PAGE_PATH = '/oauth/verify';

const buildVerifyPageHtml = (applicationId: string): string => `<!DOCTYPE html>
<html>
<head>
  <title>Apollo OAuth - Verifying...</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
    .loading { color: #6b7280; }
    .success { color: #10b981; }
    .error { color: #ef4444; }
    .spinner { border: 3px solid #f3f4f6; border-top: 3px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
  <script>
    (async function() {
      const applicationId = ${JSON.stringify(applicationId)};
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const baseUrl = window.location.origin;

      function showError(message) {
        document.addEventListener('DOMContentLoaded', function() {
          document.getElementById('spinner').style.display = 'none';
          document.getElementById('title').textContent = '✗ Connection Failed';
          document.getElementById('title').className = 'error';
          document.getElementById('status').textContent = message;
        });

        if (window.opener) {
          window.opener.postMessage({ type: 'APOLLO_OAUTH_ERROR', error: message }, '*');
        }
      }

      if (!code) {
        showError('Authorization code is missing. Please try connecting again.');
        return;
      }

      try {
        const response = await fetch(
          baseUrl + '/s/oauth/token-pairs?code=' + encodeURIComponent(code),
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error('Failed to get tokens: ' + response.status + ' - ' + errorText);
        }

        const tokens = await response.json();

        window.location.href = 'http://apple.localhost:3001/settings/applications/' + applicationId + '#custom';

      } catch (error) {
        showError(error.message);
      }
    })();
  </script>
</head>
<body>
  <div class="spinner" id="spinner"></div>
  <h1 class="loading" id="title">Connecting to Apollo...</h1>
  <p id="status">Please wait while we complete the connection.</p>
</body>
</html>`;

const handler = async (): Promise<string> => {
  const applicationId = process.env.APPLICATION_ID ?? '';

  return buildVerifyPageHtml(applicationId);
};

export default defineLogicFunction({
  universalIdentifier: '4d74950a-d9c1-4c66-a799-89c1aea4e6b0',
  name: 'get-verify-page',
  description: 'Returns the Apollo OAuth verify page',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: VERIFY_PAGE_PATH,
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
