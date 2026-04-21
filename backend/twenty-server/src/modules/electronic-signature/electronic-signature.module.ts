import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ElectronicSignatureService } from 'src/modules/electronic-signature/services/electronic-signature.service';
import { DocuSignService } from 'src/modules/electronic-signature/services/docusign.service';
import {
  SignatureRequestWorkspaceEntity,
  SignatureSignerWorkspaceEntity,
  SignatureEventWorkspaceEntity
} from 'src/modules/electronic-signature/standard-objects/signature-request.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SignatureRequestWorkspaceEntity,
      SignatureSignerWorkspaceEntity,
      SignatureEventWorkspaceEntity,
      WorkspaceMemberWorkspaceEntity,
    ]),
  ],
  providers: [ElectronicSignatureService, DocuSignService],
  exports: [ElectronicSignatureService, DocuSignService],
})
export class ElectronicSignatureModule {}
