import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM'] as const;

type ShutdownSignal = (typeof SHUTDOWN_SIGNALS)[number];

const EXIT_CODE_BY_SIGNAL: Record<ShutdownSignal, number> = {
  SIGINT: 130,
  SIGTERM: 143,
};

@Injectable()
export class CommandShutdownService {
  private readonly logger = new Logger(CommandShutdownService.name);

  private receivedSignal: ShutdownSignal | undefined;
  private isListening = false;

  listenToShutdownSignals(): void {
    if (this.isListening) {
      return;
    }

    this.isListening = true;

    for (const shutdownSignal of SHUTDOWN_SIGNALS) {
      process.on(shutdownSignal, () => this.handleSignal(shutdownSignal));
    }
  }

  isShutdownRequested(): boolean {
    return isDefined(this.receivedSignal);
  }

  private handleSignal(shutdownSignal: ShutdownSignal): void {
    if (isDefined(this.receivedSignal)) {
      this.logger.warn(
        `Received ${shutdownSignal} again, exiting immediately. ` +
          'The step in progress is left unfinished, rerun the command to resume from the last recorded step.',
      );

      process.exit(EXIT_CODE_BY_SIGNAL[shutdownSignal]);
    }

    this.receivedSignal = shutdownSignal;
    process.exitCode = EXIT_CODE_BY_SIGNAL[shutdownSignal];

    this.logger.warn(
      `Received ${shutdownSignal}, finishing the step in progress then stopping. ` +
        `Send ${shutdownSignal} again to exit immediately.`,
    );
  }
}
