import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FormBooleanFieldInput } from '@/object-record/record-field/form-types/components/FormBooleanFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { isFieldBoolean } from '@/object-record/record-field/types/guards/isFieldBoolean';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import { WorkflowRecordCreateAction } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import { Fragment, useEffect, useState } from 'react';
import {
  HorizontalSeparator,
  IconAddressBook,
  isDefined,
  useIcons,
} from 'twenty-ui';
import { JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { FieldMetadataType } from '~/generated/graphql';

type WorkflowEditActionFormRecordCreateProps = {
  action: WorkflowRecordCreateAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowRecordCreateAction) => void;
      };
};

type SendEmailFormData = {
  objectName: string;
  [field: string]: unknown;
};

export const WorkflowEditActionFormRecordCreate = ({
  action,
  actionOptions,
}: WorkflowEditActionFormRecordCreateProps) => {
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
    objectName: action.settings.input.objectName,
    ...action.settings.input.objectRecord,
  });
  const isFormDisabled = actionOptions.readonly;

  const handleFieldChange = (
    fieldName: keyof SendEmailFormData,
    updatedValue: JsonValue,
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
      objectName: action.settings.input.objectName,
      ...action.settings.input.objectRecord,
    });
  }, [action.settings.input]);

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
      if (actionOptions.readonly === true) {
        return;
      }

      const { objectName: updatedObjectName, ...updatedOtherFields } = formData;

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
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

  const headerTitle = isDefined(action.name) ? action.name : `Create Record`;

  return (
    <WorkflowEditGenericFormBase
      onTitleChange={(newName: string) => {
        if (actionOptions.readonly === true) {
          return;
        }

        actionOptions.onActionUpdate({
          ...action,
          name: newName,
        });
      }}
      HeaderIcon={
        <IconAddressBook
          color={theme.font.color.tertiary}
          stroke={theme.icon.stroke.sm}
        />
      }
      headerTitle={headerTitle}
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

      <HorizontalSeparator noMargin />

      {editableFields.map((field) => {
        const currentValue = formData[field.name];

        return (
          <Fragment key={field.id}>
            {isFieldNumber(field) ? (
              <FormNumberFieldInput
                key={field.id}
                defaultValue={currentValue as string | number | undefined}
                onPersist={(value) => {
                  handleFieldChange(field.name, value);
                }}
                placeholder="Fill with number"
              />
            ) : isFieldBoolean(field) ? (
              <FormBooleanFieldInput
                key={field.id}
                defaultValue={currentValue as string | boolean | undefined}
                onPersist={(value) => {
                  handleFieldChange(field.name, value);
                }}
              />
            ) : isFieldText(field) ? (
              <FormTextFieldInput
                defaultValue={currentValue as string | undefined}
                onPersist={(value) => {
                  handleFieldChange(field.name, value);
                }}
                placeholder="Enter value tiptap"
              />
            ) : null}
          </Fragment>
        );
      })}
    </WorkflowEditGenericFormBase>
  );
};
