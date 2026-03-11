import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/logic-function/logic-function-resource/sdk-client-generation.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEntity])],
  providers: [LogicFunctionResourceService, SdkClientGenerationService],
  exports: [LogicFunctionResourceService, SdkClientGenerationService],
})
export class LogicFunctionResourceModule {}
