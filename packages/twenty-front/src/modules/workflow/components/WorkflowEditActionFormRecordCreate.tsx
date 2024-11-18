import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import VariableTagInput from '@/workflow/search-variables/components/VariableTagInput';
import { WorkflowRecordCreateAction } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import { IconAddressBook, isDefined, useIcons } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';
import { FieldMetadataType } from '~/generated/graphql';

type WorkflowEditActionFormRecordCreateProps =
  | {
      action: WorkflowRecordCreateAction;
      readonly: true;
    }
  | {
      action: WorkflowRecordCreateAction;
      readonly?: false;
      onActionUpdate: (action: WorkflowRecordCreateAction) => void;
    };

type SendEmailFormData = {
  objectName: string;
  [field: string]: unknown;
};

export const WorkflowEditActionFormRecordCreate = (
  props: WorkflowEditActionFormRecordCreateProps,
) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
      Icon: getIcon(item.icon),
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  const [formData, setFormData] = useState<SendEmailFormData>({
    objectName: props.action.settings.input.objectName,
    ...props.action.settings.input.objectRecord,
  });
  const isFormDisabled = props.readonly;

  const handleFieldChange = (
    fieldName: keyof SendEmailFormData,
    updatedValue: string,
  ) => {
    const newFormData: SendEmailFormData = {
      ...formData,
      [fieldName]: updatedValue,
    };

    setFormData(newFormData);

    saveAction(newFormData);
  };

  useEffect(() => {
    setFormData({
      objectName: props.action.settings.input.objectName,
      ...props.action.settings.input.objectRecord,
    });
  }, [props.action.settings.input]);

  const selectedObjectMetadataItemNameSingular = formData.objectName;

  const selectedObjectMetadataItem = activeObjectMetadataItems.find(
    (item) => item.nameSingular === selectedObjectMetadataItemNameSingular,
  );
  if (!isDefined(selectedObjectMetadataItem)) {
    throw new Error('Should have found the metadata item');
  }

  const editableFields = selectedObjectMetadataItem.fields.filter(
    (field) =>
      field.type !== FieldMetadataType.Relation &&
      !field.isSystem &&
      field.isActive,
  );

  const saveAction = useDebouncedCallback(
    async (formData: SendEmailFormData) => {
      if (props.readonly === true) {
        return;
      }

      const { objectName: updatedObjectName, ...updatedOtherFields } = formData;

      props.onActionUpdate({
        ...props.action,
        settings: {
          ...props.action.settings,
          input: {
            type: 'CREATE',
            objectName: updatedObjectName,
            objectRecord: updatedOtherFields,
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
    <WorkflowEditGenericFormBase
      HeaderIcon={
        <IconAddressBook
          color={theme.font.color.tertiary}
          stroke={theme.icon.stroke.sm}
        />
      }
      headerTitle="Record Create"
      headerType="Action"
    >
      <Select
        dropdownId="workflow-edit-action-record-create-object-name"
        label="Object"
        fullWidth
        disabled={isFormDisabled}
        value={formData.objectName}
        emptyOption={{ label: 'Select an option', value: '' }}
        options={availableMetadata}
        onChange={(updatedObjectName) => {
          const newFormData: SendEmailFormData = {
            objectName: updatedObjectName,
          };

          setFormData(newFormData);

          saveAction(newFormData);
        }}
      />

      {editableFields.map((field) => (
        <VariableTagInput
          key={field.id}
          inputId={field.id}
          label={field.label}
          placeholder="Enter value (use {{variable}} for dynamic content)"
          value={formData[field.name] as string | undefined}
          onChange={(value) => {
            handleFieldChange(field.name, value);
          }}
        />
      ))}
    </WorkflowEditGenericFormBase>
  );
};
