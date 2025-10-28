import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([KeyValuePairEntity]),
        TypeORMModule,
      ],
    }),
  ],
  exports: [KeyValuePairService],
  providers: [KeyValuePairService],
})
export class KeyValuePairModule {}
