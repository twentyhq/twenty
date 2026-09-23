export const buildServerCronStepJobId = ({
  applicationRegistrationId,
  logicFunctionUniversalIdentifier,
  scheduledAtEpochMs,
  step,
}: {
  applicationRegistrationId: string;
  logicFunctionUniversalIdentifier: string;
  scheduledAtEpochMs: number;
  step: number;
}): string =>
  `server-cron.${applicationRegistrationId}.${logicFunctionUniversalIdentifier}.${scheduledAtEpochMs}.${step}`;
