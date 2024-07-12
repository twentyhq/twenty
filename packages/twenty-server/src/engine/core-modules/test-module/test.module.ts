import { Module } from '@nestjs/common';

import { TestResolver } from 'src/engine/core-modules/test-module/test.resolver';

@Module({
  imports: [],
  providers: [TestResolver],
  exports: [],
})
export class TestModule {}
