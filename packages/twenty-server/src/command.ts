import { CommandFactory } from 'nest-commander';

import { CommandModule } from './command.module';

import { LoggerService } from './integrations/logger/logger.service';
import { ExceptionHandlerService } from './integrations/exception-handler/exception-handler.service';

async function bootstrap() {
  const app = await CommandFactory.createWithoutRunning(CommandModule, {
    bufferLogs: true,
    errorHandler: (err: Error) => {
      logger.error(err?.message, err?.name);
      exceptionHandlerService.captureExceptions([err]);
    },
    serviceErrorHandler: (err: Error) => {
      logger.error(err?.message, err?.name);
      exceptionHandlerService.captureExceptions([err]);
    },
  });
  const logger = app.get(LoggerService);
  const exceptionHandlerService = app.get(ExceptionHandlerService);

  // Inject our logger
  app.useLogger(logger);

  await CommandFactory.runApplication(app);

  app.close();
}
bootstrap();
