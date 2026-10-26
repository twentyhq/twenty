import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type GettingStartedWorkflowTemplate } from 'src/engine/core-modules/getting-started/types/getting-started-workflow-template.type';
import { buildHandoverWorkflow } from 'src/engine/core-modules/getting-started/utils/build-handover-workflow.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';

export const GETTING_STARTED_HANDOVER_WORKFLOW_TEMPLATE: GettingStartedWorkflowTemplate =
  {
    name: 'Hand over won deals',
    buildWorkflow: ({ connectedAccountId, flatFieldMetadataMaps }) =>
      buildHandoverWorkflow({
        connectedAccountId,
        companyIdFieldId: findFlatEntityByUniversalIdentifierOrThrow({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier:
            STANDARD_OBJECTS.company.fields.id.universalIdentifier,
        }).id,
        memberIdFieldId: findFlatEntityByUniversalIdentifierOrThrow({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier:
            STANDARD_OBJECTS.workspaceMember.fields.id.universalIdentifier,
        }).id,
        opportunityStageFieldId: findFlatEntityByUniversalIdentifierOrThrow({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier:
            STANDARD_OBJECTS.opportunity.fields.stage.universalIdentifier,
        }).id,
      }),
  };
