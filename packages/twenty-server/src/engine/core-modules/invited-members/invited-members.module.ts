/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { InvitedMembers } from 'src/engine/core-modules/invited-members/invited-members.entity';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';


@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([InvitedMembers], 'core'),
        TypeORMModule,
      ],
    }),
    DataSourceModule,
    TypeOrmModule.forFeature([KeyValuePair], 'core'),
  ],
  providers: [ TypeORMService],
})
export class InvitedMembersModule {}
