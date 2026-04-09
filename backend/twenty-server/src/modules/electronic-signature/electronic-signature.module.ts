import { Module } from '@nestjs/common';

import { ElectronicSignatureService } from 'src/modules/electronic-signature/services/electronic-signature.service';

@Module({
  providers: [ElectronicSignatureService],
  exports: [ElectronicSignatureService],
})
export class ElectronicSignatureModule {}
