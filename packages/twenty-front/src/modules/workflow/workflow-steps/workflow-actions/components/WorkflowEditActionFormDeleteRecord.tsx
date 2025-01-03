import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowDeleteRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { WorkflowSingleRecordPicker } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowSingleRecordPicker';
import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import {
  HorizontalSeparator,
  IconAddressBook,
  isDefined,
  useIcons,
} from 'twenty-ui';

import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';

type WorkflowEditActionFormDeleteRecordProps = {
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
  objectName: string;
  objectRecordId: string;
};

export const WorkflowEditActionFormDeleteRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionFormDeleteRecordProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
      Icon: getIcon(item.icon),
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  const [formData, setFormData] = useState<DeleteRecordFormData>({
    objectName: action.settings.input.objectName,
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

  const selectedObjectMetadataItemNameSingular = formData.objectName;

  const selectedObjectMetadataItem = activeObjectMetadataItems.find(
    (item) => item.nameSingular === selectedObjectMetadataItemNameSingular,
  );
  if (!isDefined(selectedObjectMetadataItem)) {
    throw new Error('Should have found the metadata item');
  }

  const saveAction = useDebouncedCallback(
    async (formData: DeleteRecordFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      const {
        objectName: updatedObjectName,
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

  const headerTitle = isDefined(action.name) ? action.name : `Delete Record`;

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
        Icon={IconAddressBook}
        iconColor={theme.font.color.tertiary}
        initialTitle={headerTitle}
        headerType="Action"
      />
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-action-record-delete-object-name"
          label="Object"
          fullWidth
          disabled={isFormDisabled}
          value={formData.objectName}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(objectName) => {
            const newFormData: DeleteRecordFormData = {
              objectName,
              objectRecordId: '',
            };

            setFormData(newFormData);

            saveAction(newFormData);
          }}
        />

        <HorizontalSeparator noMargin />

        <WorkflowSingleRecordPicker
          label="Record"
          onChange={(objectRecordId) =>
            handleFieldChange('objectRecordId', objectRecordId)
          }
          objectNameSingular={formData.objectName}
          defaultValue={formData.objectRecordId}
        />
      </WorkflowStepBody>
    </>
  );
};
