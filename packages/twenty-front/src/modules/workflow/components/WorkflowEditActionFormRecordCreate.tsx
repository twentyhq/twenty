import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import VariableTagInput from '@/workflow/search-variables/components/VariableTagInput';
import { WorkflowRecordCreateAction } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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

  const form = useForm<SendEmailFormData>({
    defaultValues: {
      objectName: activeObjectMetadataItems[0].nameSingular,
      ...props.action.settings.input.objectRecord,
    },
    disabled: props.readonly,
  });

  useEffect(() => {
    form.setValue('objectName', props.action.settings.input.objectName);

    for (const [property, value] of Object.entries(
      props.action.settings.input.objectRecord,
    )) {
      form.setValue(property, value);
    }
  }, [props.action.settings.input, form]);

  const selectedObjectMetadataItemNameSingular = form.watch('objectName');

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

  const handleSave = form.handleSubmit((formData: SendEmailFormData) =>
    saveAction(formData),
  );

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
      <Controller
        name="objectName"
        control={form.control}
        render={({ field, formState }) => (
          <Select
            dropdownId="workflow-edit-action-record-create-object-name"
            label="Object"
            fullWidth
            disabled={formState.disabled}
            value={field.value}
            emptyOption={{ label: 'Select an option', value: '' }}
            options={availableMetadata}
            onChange={(updatedObjectName) => {
              field.onChange(updatedObjectName);
              handleSave();
            }}
          />
        )}
      />

      {editableFields.map((field) => (
        <Controller
          key={field.id}
          name={field.name}
          control={form.control}
          render={({ field: formField }) => (
            <VariableTagInput
              inputId={field.id}
              label={field.label}
              placeholder="Enter value (use {{variable}} for dynamic content)"
              // @ts-expect-error Temporary fix
              value={formField.value}
              onChange={(value) => {
                formField.onChange(value);
                handleSave();
              }}
            />
          )}
        />
      ))}
    </WorkflowEditGenericFormBase>
  );
};
