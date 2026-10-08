import { InputType } from '@nestjs/graphql';

import { CreateCoreWorkflowVersionEdgeInput } from 'src/engine/core-modules/workflow/dtos/create-core-workflow-version-edge.input';

@InputType()
export class DeleteCoreWorkflowVersionEdgeInput extends CreateCoreWorkflowVersionEdgeInput {}
