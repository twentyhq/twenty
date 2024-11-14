import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import { WorkflowRecordCreateAction } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IconAddressBook, isDefined } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

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
};

export const WorkflowEditActionFormRecordCreate = (
  props: WorkflowEditActionFormRecordCreateProps,
) => {
  const theme = useTheme();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  const form = useForm<SendEmailFormData>({
    defaultValues: {
      objectName: activeObjectMetadataItems[0].nameSingular,
    },
    disabled: props.readonly,
  });

  useEffect(() => {
    form.setValue('objectName', props.action.settings.input.objectName);
  }, [props.action.settings, form]);

  const selectedObjectMetadataItemNameSingular = form.watch('objectName');
  const selectedObjectMetadataItem = activeObjectMetadataItems.find(
    (item) => item.nameSingular === selectedObjectMetadataItemNameSingular,
  );
  if (!isDefined(selectedObjectMetadataItem)) {
    throw new Error('Should have found the metadata item');
  }

  console.log(selectedObjectMetadataItem.fields[0]);

  const saveAction = useDebouncedCallback(
    async (formData: SendEmailFormData, checkScopes = false) => {
      if (props.readonly === true) {
        return;
      }

      // props.onActionUpdate({
      //   ...props.action,
      //   settings: {
      //     ...props.action.settings,
      //     input: {
      //       connectedAccountId: formData.connectedAccountId,
      //       email: formData.email,
      //       subject: formData.subject,
      //       body: formData.body,
      //     },
      //   },
      // });
    },
    1_000,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleSave = (checkScopes = false) =>
    form.handleSubmit((formData: SendEmailFormData) =>
      saveAction(formData, checkScopes),
    )();

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

      {selectedObjectMetadataItem.fields
        .filter((field) => !field.isSystem)
        .map((field) => (
          <p>{field.label}</p>
        ))}
    </WorkflowEditGenericFormBase>
  );
};
