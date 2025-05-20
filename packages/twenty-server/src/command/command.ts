import { CommandFactory } from 'nest-commander';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';

import { CommandModule } from './command.module';

async function bootstrap() {
  const errorHandler = (err: Error) => {
    loggerService.error(err?.message, err?.name);

    if (shouldCaptureException(err)) {
      exceptionHandlerService.captureExceptions([err]);
    }
  };

  const app = await CommandFactory.createWithoutRunning(CommandModule, {
    logger: ['error', 'warn', 'log'],
    bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
    errorHandler,
    serviceErrorHandler: errorHandler,
  });
  const loggerService = app.get(LoggerService);
  const exceptionHandlerService = app.get(ExceptionHandlerService);

  // Inject our logger
  app.useLogger(loggerService);

  await CommandFactory.runApplication(app);

  app.close();
}
bootstrap();
