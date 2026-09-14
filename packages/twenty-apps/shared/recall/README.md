# Recall transport

Shared by Call Recorder and Desktop Recorder. Includes HTTP requests, retry/backoff policy, and webhook signature verification. Each app retains its own credentials, metadata, and recording lifecycle.

The Twenty SDK bundles these relative source imports into each logic function; no runtime dependency or separate release is needed. Run the Recall API tests in both apps when changing this module.
