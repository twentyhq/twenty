import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { WorkflowFindRecordsAction } from '@/workflow/types/Workflow';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useEffect, useState } from 'react';

import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { useActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionHeaderTypeOrThrow';
import { useActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionIconColorOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { useDebouncedCallback } from 'use-debounce';

type WorkflowEditActionFindRecordsProps = {
  action: WorkflowFindRecordsAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowFindRecordsAction) => void;
      };
};

type FindRecordsFormData = {
  objectName: string;
  limit?: number;
};

export const WorkflowEditActionFindRecords = ({
  action,
  actionOptions,
}: WorkflowEditActionFindRecordsProps) => {
  const { getIcon } = useIcons();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
      Icon: getIcon(item.icon),
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  const [formData, setFormData] = useState<FindRecordsFormData>({
    objectName: action.settings.input.objectName,
    limit: action.settings.input.limit,
  });
  const isFormDisabled = actionOptions.readonly;

  const selectedObjectMetadataItemNameSingular =
    activeObjectMetadataItems.find(
      (item) => item.nameSingular === formData.objectName,
    )?.nameSingular ?? '';

  const saveAction = useDebouncedCallback(
    async (formData: FindRecordsFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      const { objectName: updatedObjectName, limit: updatedLimit } = formData;

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            objectName: updatedObjectName,
            limit: updatedLimit ?? 1,
          },
        },
      });
    },
    1_000,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const headerTitle = isDefined(action.name) ? action.name : `Search Records`;
  const headerIcon = getActionIcon(action.type);
  const headerIconColor = useActionIconColorOrThrow(action.type);
  const headerType = useActionHeaderTypeOrThrow(action.type);

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (actionOptions.readonly === true) {
            return;
          }

          actionOptions.onActionUpdate({
            ...action,
            name: newName,
          });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={isFormDisabled}
      />
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-action-record-find-records-object-name"
          label="Object"
          fullWidth
          disabled={isFormDisabled}
          value={selectedObjectMetadataItemNameSingular}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(objectName) => {
            const newFormData: FindRecordsFormData = {
              objectName,
              limit: 1,
            };

            setFormData(newFormData);

            saveAction(newFormData);
          }}
          withSearchInput
        />

        <HorizontalSeparator noMargin />

        <FormNumberFieldInput
          label="Limit"
          defaultValue={formData.limit}
          placeholder="Enter limit"
          onChange={() => {}}
          readonly
        />
      </WorkflowStepBody>
    </>
  );
};
