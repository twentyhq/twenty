import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { DpaDocumentDTO } from 'src/engine/core-modules/dpa/dtos/dpa-document.dto';
import { type GenerateSignedDpaInput } from 'src/engine/core-modules/dpa/dtos/generate-signed-dpa.input';
import { type GenerateSignedDpaResult } from 'src/engine/core-modules/dpa/dtos/generate-signed-dpa.result';
import { DpaAgreementEntity } from 'src/engine/core-modules/dpa/entities/dpa-agreement.entity';
import { DpaAgreementType } from 'src/engine/core-modules/dpa/enums/dpa-agreement-type.enum';
import { DpaRegionService } from 'src/engine/core-modules/dpa/services/dpa-region.service';
import { type ResolvedDpa } from 'src/engine/core-modules/dpa/types/dpa.types';
import { buildDpaAgreementRecord } from 'src/engine/core-modules/dpa/utils/build-dpa-agreement-record.util';
import { resolveDpa } from 'src/engine/core-modules/dpa/utils/resolve-dpa.util';
import { renderDpaToPdfBuffer } from 'src/engine/core-modules/dpa/pdf/render-dpa-to-pdf.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const toDocumentDto = (resolved: ResolvedDpa): DpaDocumentDTO => ({
  title: resolved.title,
  lastUpdatedLabel: resolved.lastUpdatedLabel,
  templateVersion: resolved.templateVersion,
  region: resolved.region,
  processorEntity: resolved.values.PROCESSOR_ENTITY,
  sccSectionActive: resolved.sccSectionActive,
  blocks: resolved.blocks.map((block) => ({
    kind: block.kind,
    text: block.text,
    label: block.label,
    value: block.value,
  })),
});

@Injectable()
export class DpaService {
  constructor(
    // Low-frequency legal records, always queried by explicit workspaceId.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(DpaAgreementEntity)
    private readonly dpaAgreementRepository: Repository<DpaAgreementEntity>,
    private readonly dpaRegionService: DpaRegionService,
    private readonly fileStorageService: FileStorageService,
    private readonly fileUrlService: FileUrlService,
    private readonly applicationService: ApplicationService,
  ) {}

  // Resolved DPA for preview (no signature). Region/entity/law are resolved from
  // the workspace deployment — the customer never picks these.
  getPreviewForWorkspace(workspace: Pick<WorkspaceEntity, 'id'>): DpaDocumentDTO {
    const region = this.dpaRegionService.getRegionForWorkspace(workspace);

    return toDocumentDto(resolveDpa({ region, mode: 'preview' }));
  }

  async listAgreements(workspaceId: string): Promise<DpaAgreementEntity[]> {
    return this.dpaAgreementRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  // In-app signed-PDF generation: resolve → render PDF → store executed copy →
  // persist the legal record → return a signed download URL.
  async generateSignedDpa({
    workspace,
    userId,
    userEmail,
    input,
  }: {
    workspace: Pick<WorkspaceEntity, 'id'>;
    userId: string;
    userEmail: string;
    input: GenerateSignedDpaInput;
  }): Promise<GenerateSignedDpaResult> {
    const region = this.dpaRegionService.getRegionForWorkspace(workspace);
    const executedAt = new Date();

    const resolved = resolveDpa({
      region,
      mode: 'signed',
      customerLegalEntityName: input.customerLegalEntityName,
      signatory: { name: input.signatoryName, title: input.signatoryTitle },
      executedAt: executedAt.toISOString(),
    });

    const pdfBuffer = await renderDpaToPdfBuffer(resolved);

    const fileId = v4();

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId: workspace.id },
      );

    await this.fileStorageService.writeFile({
      sourceFile: pdfBuffer,
      resourcePath: `${fileId}.pdf`,
      fileFolder: FileFolder.Dpa,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      workspaceId: workspace.id,
      fileId,
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    const agreement = await this.dpaAgreementRepository.save(
      buildDpaAgreementRecord({
        workspaceId: workspace.id,
        type: DpaAgreementType.SIGNED,
        region,
        acceptedAt: executedAt,
        acceptedByUserId: userId,
        acceptedByEmail: userEmail,
        customerLegalEntityName: input.customerLegalEntityName,
        signatoryName: input.signatoryName,
        signatoryTitle: input.signatoryTitle,
        signedFileId: fileId,
      }),
    );

    const downloadUrl = await this.fileUrlService.signFileByIdUrl({
      fileId,
      workspaceId: workspace.id,
      fileFolder: FileFolder.Dpa,
    });

    return { agreement, downloadUrl };
  }
}
