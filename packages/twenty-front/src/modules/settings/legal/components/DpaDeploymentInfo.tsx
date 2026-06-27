import { useLingui } from '@lingui/react/macro';
import { Info } from 'twenty-ui/feedback';

import { type DpaDocument } from '@/settings/legal/types/Dpa';

type DpaDeploymentInfoProps = {
  document: DpaDocument;
};

// Surfaces the deployment-resolved facts (contracting entity, region, template
// version, SCC state) and, on self-hosted deployments, the "not a valid
// agreement" notice. Reuses the shared Info component.
export const DpaDeploymentInfo = ({ document }: DpaDeploymentInfoProps) => {
  const { t } = useLingui();

  const sccStatusLabel = document.sccSectionActive ? t`active` : t`dormant`;

  const deploymentInfo = t`Contracting Processor: ${document.processorEntity} · Region: ${document.region} · Template version ${document.templateVersion} (last updated ${document.lastUpdatedLabel}). International data-transfer (SCC) section is ${sccStatusLabel}. Sub-processors are listed at trust.twenty.com.`;

  return (
    <>
      {document.notice && <Info accent="danger" text={document.notice} />}
      <Info accent="blue" text={deploymentInfo} />
    </>
  );
};
