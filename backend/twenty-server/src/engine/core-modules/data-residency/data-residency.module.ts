import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataResidencyEntity } from './data-residency.entity';
import { DataResidencyService } from './data-residency.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataResidencyEntity])],
  providers: [DataResidencyService],
  exports: [DataResidencyService],
})
export class DataResidencyModule {}