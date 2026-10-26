import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type WorkflowVersionEdge } from 'src/modules/workflow/workflow-builder/utils/assemble-workflow-version-content.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export type GettingStartedWorkflowTemplate = {
  name: string;
  buildWorkflow: (input: {
    connectedAccountId: string;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }) => {
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
    edges: WorkflowVersionEdge[];
  };
};
