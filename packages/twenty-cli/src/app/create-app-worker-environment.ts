import { TARGET_ENVIRONMENT_VARIABLE } from '@/target/constants/target-environment-variable.constant';

const SCRUBBED_ENVIRONMENT_VARIABLES = new Set<string>([
  ...Object.values(TARGET_ENVIRONMENT_VARIABLE),
  'TWENTY_APP_ACCESS_TOKEN',
  'TWENTY_APP_APPLICATION_ACCESS_TOKEN',
]);

const CREDENTIAL_ENVIRONMENT_VARIABLE_PATTERN =
  /^TWENTY_.*(TOKEN|KEY|SECRET|PASSWORD)$/;

export const createAppWorkerEnvironment = (
  environment: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv =>
  Object.fromEntries(
    Object.entries(environment).filter(
      ([name]) =>
        !SCRUBBED_ENVIRONMENT_VARIABLES.has(name) &&
        !CREDENTIAL_ENVIRONMENT_VARIABLE_PATTERN.test(name),
    ),
  );
