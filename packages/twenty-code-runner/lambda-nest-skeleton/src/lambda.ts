import { NestFactory } from '@nestjs/core';
import { Handler } from 'aws-lambda';

import { MyCustomModule } from './my-custom/my-custom.module';
import { MyCustomService } from './my-custom/services/my-custom.service';
import { AppModule } from './app.module';

export const handler: Handler = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const myCustomService = await app.select(MyCustomModule).get(MyCustomService);
  const result = myCustomService.handle();
  await app.close();
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
