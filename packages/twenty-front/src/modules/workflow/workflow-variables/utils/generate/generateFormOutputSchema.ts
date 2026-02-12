import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { type FormOutputSchema } from '@/workflow/workflow-variables/types/FormOutputSchema';
import { generateFakeValue } from '@/workflow/workflow-variables/utils/generate/generateFakeValue';
import { generateRecordOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordOutputSchema';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const generateFormOutputSchema = (
  formFields: WorkflowFormActionField[],
  objectMetadataItems: ObjectMetadataItem[],
): FormOutputSchema => {
  const result: FormOutputSchema = {};

  for (const formField of formFields) {
    if (formField.type === 'RECORD') {
      const objectName = formField.settings?.objectName;

      if (!isDefined(objectName)) {
        continue;
      }

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === objectName,
      );

      if (!isDefined(objectMetadataItem)) {
        continue;
      }

      result[formField.name] = {
        isLeaf: false,
        label: formField.label,
        value: generateRecordOutputSchema(objectMetadataItem),
      };
    } else {
      result[formField.name] = {
        isLeaf: true,
        type: formField.type as FieldMetadataType,
        label: formField.label,
        value:
          formField.placeholder ??
          generateFakeValue(formField.type, 'FieldMetadataType'),
      };
    }
  }

  return result;
};
