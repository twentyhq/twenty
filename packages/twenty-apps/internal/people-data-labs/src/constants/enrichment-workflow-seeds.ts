import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { type EnrichmentWorkflowSeed } from 'src/types/enrichment-workflow-seed.type';

const ENRICHMENT_ICON = 'IconSparkles';

export const ENRICHMENT_WORKFLOW_SEEDS: EnrichmentWorkflowSeed[] = [
  {
    objectNameSingular: 'company',
    workflowName: 'Enrich companies with People Data Labs',
    triggerName: 'When companies are selected',
    icon: ENRICHMENT_ICON,
    stepName: 'Enrich with People Data Labs',
    logicFunctionUniversalIdentifier:
      PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichCompany,
    logicFunctionInput: { records: '{{trigger.companies}}' },
  },
  {
    objectNameSingular: 'person',
    workflowName: 'Enrich people with People Data Labs',
    triggerName: 'When people are selected',
    icon: ENRICHMENT_ICON,
    stepName: 'Enrich with People Data Labs',
    logicFunctionUniversalIdentifier:
      PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichPerson,
    logicFunctionInput: { records: '{{trigger.people}}' },
  },
];
