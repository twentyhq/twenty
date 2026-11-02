import { type GettingStartedProgressDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-progress.dto';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { type GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';

export type GettingStartedProgress = Omit<
  GettingStartedProgressDTO,
  'steps'
> & {
  stepActionKeys: GettingStartedStepActionKey[];
  companyEnrichment: WorkspaceCompanyEnrichment | null;
};
