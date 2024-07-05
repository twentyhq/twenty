import { Module } from '@nestjs/common';

import { MyCustomModule } from './my-custom/my-custom.module';
import { MyCustomService } from './my-custom/services/my-custom.service';

@Module({
  imports: [MyCustomModule],
  providers: [MyCustomService],
  exports: [MyCustomModule, MyCustomService],
})
export class AppModule {}
