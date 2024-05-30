import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([KeyValuePair], 'core'),
        TypeORMModule,
      ],
    }),
  ],
  exports: [KeyValuePairService],
  providers: [KeyValuePairService],
})
export class KeyValuePairModule {}
