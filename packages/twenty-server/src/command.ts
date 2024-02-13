import { CommandFactory } from 'nest-commander';

import { CommandModule } from './command.module';

import { LoggerService } from './integrations/logger/logger.service';
import { ExceptionHandlerService } from './integrations/exception-handler/exception-handler.service';
import { filterException } from './filters/utils/global-exception-handler.util';

async function bootstrap() {
  const errorHandler = (err: Error) => {
    loggerService.error(err?.message, err?.name);

    if (filterException(err)) {
      return;
    }

    exceptionHandlerService.captureExceptions([err]);
  };

  const app = await CommandFactory.createWithoutRunning(CommandModule, {
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
