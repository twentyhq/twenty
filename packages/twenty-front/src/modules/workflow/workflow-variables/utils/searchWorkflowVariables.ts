import { isBaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isBaseOutputSchemaV2';
import { isLinkOutputSchema } from '@/workflow/workflow-variables/types/guards/isLinkOutputSchema';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import {
  type OutputSchemaV2,
  type StepOutputSchemaV2,
} from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { type WorkflowVariableSearchResult } from '@/workflow/workflow-variables/types/WorkflowVariableSearchResult';
import { getStepItemIcon } from '@/workflow/workflow-variables/utils/getStepItemIcon';
import { getWorkflowVariableSpecialItems } from '@/workflow/workflow-variables/utils/getWorkflowVariableSpecialItems';
import { isDefined } from 'twenty-shared/utils';
import { isObject } from '@sniptt/guards';

export const searchWorkflowVariables = ({
  steps,
  searchInputValue,
  shouldDisplaySpecialItems = true,
}: {
  steps: StepOutputSchemaV2[];
  searchInputValue: string;
  shouldDisplaySpecialItems?: boolean;
}): WorkflowVariableSearchResult[] => {
  const search = searchInputValue.trim().toLowerCase();

  if (search.length === 0) {
    return [];
  }

  return steps.flatMap((step) => {
    const results: WorkflowVariableSearchResult[] = [];

    const visitOutputSchema = (
      outputSchema: OutputSchemaV2,
      path: string[],
      labels: string[],
    ) => {
      const breadcrumb = [step.name, ...labels].join(' / ');

      const specialItems = shouldDisplaySpecialItems
        ? getWorkflowVariableSpecialItems({
            step,
            currentPath: path,
            searchInputValue: search,
          })
        : [];

      for (const specialItem of specialItems) {
        results.push({
          stepId: step.id,
          path: specialItem.path,
          label: specialItem.label,
          breadcrumb,
          icon: specialItem.iconName,
          isLeaf: true,
        });
      }

      if (isLinkOutputSchema(outputSchema)) {
        const label = outputSchema.link.label;

        if (isDefined(label) && label.toLowerCase().includes(search)) {
          results.push({
            stepId: step.id,
            path,
            label,
            breadcrumb,
            isLeaf: false,
          });
        }

        return;
      }

      const fields = isRecordOutputSchemaV2(outputSchema)
        ? outputSchema.fields
        : isBaseOutputSchemaV2(outputSchema)
          ? outputSchema
          : {};

      for (const [key, field] of Object.entries(fields)) {
        if (!isObject(field)) {
          continue;
        }

        const label = field.label || key;
        const fieldPath = [...path, key];

        if (label.toLowerCase().includes(search)) {
          results.push({
            stepId: step.id,
            path: fieldPath,
            label,
            breadcrumb,
            icon: field.icon ?? getStepItemIcon({ itemType: field.type }),
            isLeaf: field.isLeaf,
          });
        }

        if (!field.isLeaf && isDefined(field.value)) {
          visitOutputSchema(field.value, fieldPath, [...labels, label]);
        }
      }
    };

    visitOutputSchema(step.outputSchema, [], []);

    return results;
  });
};
