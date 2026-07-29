import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM'] as const;

type ShutdownSignal = (typeof SHUTDOWN_SIGNALS)[number];

// Shells report a signal-terminated process as 128 + signal number, we mirror
// that so orchestrators can tell an interruption apart from a real failure.
const EXIT_CODE_BY_SIGNAL: Record<ShutdownSignal, number> = {
  SIGINT: 130,
  SIGTERM: 143,
};

@Injectable()
export class CommandShutdownService {
  private readonly logger = new Logger(CommandShutdownService.name);
  private readonly abortController = new AbortController();

  private receivedSignal: ShutdownSignal | undefined;
  private isListening = false;

  // Signal listeners are only installed for CLI processes, so long-running
  // processes sharing these services keep their own shutdown semantics.
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

  get abortSignal(): AbortSignal {
    return this.abortController.signal;
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
    this.abortController.abort();

    this.logger.warn(
      `Received ${shutdownSignal}, finishing the step in progress then stopping. ` +
        `Send ${shutdownSignal} again to exit immediately.`,
    );
  }
}
