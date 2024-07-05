import { Module } from '@nestjs/common';

import { SystemModule } from '../system/system.module';

import { MyCustomService } from './services/my-custom.service';

// Add user module imports here
@Module({
  imports: [SystemModule],
  providers: [MyCustomService],
  exports: [MyCustomService],
})
export class MyCustomModule {}
