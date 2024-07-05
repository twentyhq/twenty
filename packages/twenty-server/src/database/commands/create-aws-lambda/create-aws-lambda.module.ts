import { Module } from '@nestjs/common';

import { CreateAWSLambdaService } from 'src/database/commands/create-aws-lambda/services/create-aws-lambda.service';

@Module({
  providers: [CreateAWSLambdaService],
  exports: [CreateAWSLambdaService],
})
export class CreateAWSLambdaModule {}
