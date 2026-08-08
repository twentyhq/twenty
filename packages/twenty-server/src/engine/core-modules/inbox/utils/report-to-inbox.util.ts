import { type Logger } from '@nestjs/common';

// Telling the inbox about something that happened must never break the thing
// that happened: a run that already failed, a turn that already completed, a
// thread that is already archived. Producers report through here so that stays
// true at every call site rather than at whichever ones remembered.
export const reportToInbox = async (
  logger: Logger,
  subject: string,
  report: () => Promise<unknown>,
): Promise<void> => {
  try {
    await report();
  } catch (error) {
    logger.warn(
      `Could not update the inbox for ${subject}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};
