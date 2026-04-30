import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataResidencyEntity } from './data-residency.entity';
import { DataResidencyService } from './data-residency.service';
import { DataResidencyResolver } from './data-residency.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([DataResidencyEntity])],
  providers: [DataResidencyService, DataResidencyResolver],
  exports: [DataResidencyService],
})
export class DataResidencyModule {}