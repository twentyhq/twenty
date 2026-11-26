export const SDK_CLIENT_GENERATOR_FUNCTION_NAME_PREFIX =
  'twenty-sdk-client-generator';
export const SDK_CLIENT_GENERATOR_LAMBDA_MEMORY_MB = 2048;
export const SDK_CLIENT_GENERATOR_LAMBDA_TIMEOUT_SECONDS = 120;

// Room for a cold start, so Lambda reports its own timeout before the server
// gives up on the call.
export const SDK_CLIENT_GENERATOR_LAMBDA_INVOKE_TIMEOUT_MS =
  SDK_CLIENT_GENERATOR_LAMBDA_TIMEOUT_SECONDS * 1000 + 15_000;

// Synchronous invocations cap request and response at 6 MB: the schema goes
// in gzipped and the archive comes back base64-encoded, both below that.
export const SDK_CLIENT_GENERATOR_LAMBDA_MAX_PAYLOAD_BYTES = 5_500_000;
export const SDK_CLIENT_GENERATOR_LAMBDA_MAX_ARCHIVE_BYTES = 4 * 1024 * 1024;

export const SDK_CLIENT_PACKAGE_TEMPLATE_DIRNAME_IN_FUNCTION =
  'twenty-client-sdk';

// A subfolder, so emptying it leaves the rest of /tmp to the runtime.
export const SDK_CLIENT_GENERATION_WORK_ROOT = '/tmp/sdk-client-generation';
