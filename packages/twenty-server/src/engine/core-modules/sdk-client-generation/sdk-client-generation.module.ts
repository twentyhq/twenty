import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { SdkClientController } from 'src/engine/core-modules/sdk-client-generation/controllers/sdk-client.controller';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client-generation/sdk-client-generation.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity]),
    WorkspaceCacheModule,
    ApplicationModule,
  ],
  controllers: [SdkClientController],
  providers: [SdkClientGenerationService],
  exports: [SdkClientGenerationService],
})
export class SdkClientGenerationModule {}
