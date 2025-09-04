import { type BaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/BaseOutputSchemaV2';
import { type LinkOutputSchema } from '@/workflow/workflow-variables/types/LinkOutputSchema';

export type CodeOutputSchema = LinkOutputSchema | BaseOutputSchemaV2;
