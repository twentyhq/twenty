import { type GettingStartedProgressDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-progress.dto';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { type GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';

export type GettingStartedProgress = Omit<
  GettingStartedProgressDTO,
  'steps'
> & {
  steps: GettingStartedStep[];
  companyEnrichment: WorkspaceCompanyEnrichment | null;
};
