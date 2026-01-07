import { t } from '@lingui/core/macro';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { Select } from '@/ui/input/components/Select';
import { type WorkflowDeleteRecordAction } from '@/workflow/types/Workflow';
import { useEffect, useState } from 'react';

import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { isDefined } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';

type WorkflowEditActionDeleteRecordProps = {
  action: WorkflowDeleteRecordAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowDeleteRecordAction) => void;
      };
};

type DeleteRecordFormData = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const WorkflowEditActionDeleteRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionDeleteRecordProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeNonSystemObjectMetadataItems
      .filter((objectMetadataItem) =>
        canObjectBeManagedByWorkflow({
          nameSingular: objectMetadataItem.nameSingular,
          isSystem: objectMetadataItem.isSystem,
        }),
      )
      .map((item) => ({
        Icon: getIcon(item.icon),
        label: item.labelPlural,
        value: item.nameSingular,
      }));

  const [formData, setFormData] = useState<DeleteRecordFormData>({
    objectNameSingular: action.settings.input.objectName,
    objectRecordId: action.settings.input.objectRecordId,
  });
  const isFormDisabled = actionOptions.readonly;

  const handleFieldChange = (
    fieldName: keyof DeleteRecordFormData,
    updatedValue: JsonValue,
  ) => {
    const newFormData: DeleteRecordFormData = {
      ...formData,
      [fieldName]: updatedValue,
    };

    setFormData(newFormData);

    saveAction(newFormData);
  };

  const objectNameSingular = activeNonSystemObjectMetadataItems.find(
    (item) => item.nameSingular === formData.objectNameSingular,
  )?.nameSingular;

  const saveAction = useDebouncedCallback(
    async (formData: DeleteRecordFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      const {
        objectNameSingular: updatedObjectName,
        objectRecordId: updatedObjectRecordId,
      } = formData;

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            objectName: updatedObjectName,
            objectRecordId: updatedObjectRecordId ?? '',
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

  return (
    <>
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-action-record-delete-object-name"
          label={t`Object`}
          fullWidth
          disabled={isFormDisabled}
          value={formData.objectNameSingular}
          emptyOption={{ label: t`Select an option`, value: '' }}
          options={availableMetadata}
          onChange={(objectNameSingular) => {
            const newFormData: DeleteRecordFormData = {
              objectNameSingular,
              objectRecordId: '',
            };

            setFormData(newFormData);

            saveAction(newFormData);
          }}
          withSearchInput
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />

        <HorizontalSeparator noMargin />

        {isDefined(objectNameSingular) && (
          <FormSingleRecordPicker
            label={t`Record`}
            onChange={(objectRecordId) =>
              handleFieldChange('objectRecordId', objectRecordId)
            }
            objectNameSingulars={[objectNameSingular]}
            defaultValue={formData.objectRecordId}
            testId="workflow-edit-action-record-delete-object-record-id"
            disabled={isFormDisabled}
            VariablePicker={WorkflowVariablePicker}
          />
        )}
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
