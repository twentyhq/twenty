import { getDpaRegionConfig } from 'src/engine/core-modules/dpa/config/dpa-region-config.constant';
import { DPA_TEMPLATE_VERSION } from 'src/engine/core-modules/dpa/constants/dpa-template-version.constant';
import { type DpaAgreementEntity } from 'src/engine/core-modules/dpa/entities/dpa-agreement.entity';
import { type DpaAgreementType } from 'src/engine/core-modules/dpa/enums/dpa-agreement-type.enum';
import { type DpaRegion } from 'src/engine/core-modules/dpa/types/dpa.types';

type BuildDpaAgreementRecordArgs = {
  workspaceId: string;
  type: DpaAgreementType;
  region: DpaRegion;
  acceptedAt: Date;
  acceptedByUserId?: string;
  acceptedByEmail?: string;
  customerLegalEntityName?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  signedFileId?: string;
};

// Pure builder for a DpaAgreement row. Snapshots the contracting Processor entity
// and the template version at execution time so the record stays accurate even
// if the region config or template changes later. Used by both the click-through
// signup hook and the in-app signed generator.
export const buildDpaAgreementRecord = (
  args: BuildDpaAgreementRecordArgs,
): Partial<DpaAgreementEntity> => {
  const config = getDpaRegionConfig(args.region);

  return {
    workspaceId: args.workspaceId,
    type: args.type,
    templateVersion: DPA_TEMPLATE_VERSION,
    region: args.region,
    processorEntity: config.values.PROCESSOR_ENTITY,
    acceptedAt: args.acceptedAt,
    acceptedByUserId: args.acceptedByUserId,
    acceptedByEmail: args.acceptedByEmail,
    customerLegalEntityName: args.customerLegalEntityName,
    signatoryName: args.signatoryName,
    signatoryTitle: args.signatoryTitle,
    signedFileId: args.signedFileId,
  };
};
