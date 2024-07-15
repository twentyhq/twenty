import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FunctionService } from 'src/engine/core-modules/function/function.service';
import { FunctionResolver } from 'src/engine/core-modules/function/function.resolver';
import { CustomCodeEngineModule } from 'src/engine/integrations/custom-code-engine/custom-code-engine.module';
import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FunctionMetadataEntity], 'metadata'),
    CustomCodeEngineModule,
  ],
  providers: [FunctionService, FunctionResolver],
})
export class FunctionModule {}
