import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/components/FormFieldInput';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { useViewOrDefaultViewFromPrefetchedViews } from '@/views/hooks/useViewOrDefaultViewFromPrefetchedViews';
import { WorkflowCreateRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import {
  HorizontalSeparator,
  IconAddressBook,
  isDefined,
  useIcons,
} from 'twenty-ui';
import { JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { FieldMetadataType } from '~/generated/graphql';

type WorkflowEditActionFormCreateRecordProps = {
  action: WorkflowCreateRecordAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowCreateRecordAction) => void;
      };
};

type CreateRecordFormData = {
  objectName: string;
  [field: string]: unknown;
};

const sortByViewFieldPosition = (
  a: { viewFieldPosition?: number },
  b: { viewFieldPosition?: number },
) => {
  if (isDefined(a.viewFieldPosition) && isDefined(b.viewFieldPosition)) {
    return a.viewFieldPosition - b.viewFieldPosition;
  }

  if (isDefined(a.viewFieldPosition)) {
    return -1;
  }

  if (isDefined(b.viewFieldPosition)) {
    return 1;
  }

  return 0;
};

export const WorkflowEditActionFormCreateRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionFormCreateRecordProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
      Icon: getIcon(item.icon),
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  const [formData, setFormData] = useState<CreateRecordFormData>({
    objectName: action.settings.input.objectName,
    ...action.settings.input.objectRecord,
  });
  const isFormDisabled = actionOptions.readonly;

  const objectNameSingular = formData.objectName;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { view: indexView } = useViewOrDefaultViewFromPrefetchedViews({
    objectMetadataItemId: objectMetadataItem.id ?? '',
    viewId: undefined,
  });

  const viewFields = indexView?.viewFields ?? [];

  const inlineFieldMetadataItems = objectMetadataItem.fields
    .filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.type !== FieldMetadataType.Relation &&
        !fieldMetadataItem.isSystem &&
        fieldMetadataItem.isActive,
    )
    .map((fieldMetadataItem) => {
      const viewField = viewFields.find(
        (viewField) => viewField.fieldMetadataId === fieldMetadataItem.id,
      );
      return {
        ...fieldMetadataItem,
        viewFieldPosition: viewField?.position,
      };
    })
    .sort(sortByViewFieldPosition);

  const inlineFieldDefinitions = inlineFieldMetadataItems.map(
    (fieldMetadataItem) =>
      formatFieldMetadataItemAsFieldDefinition({
        field: fieldMetadataItem,
        objectMetadataItem,
        showLabel: true,
        labelWidth: 90,
      }),
  );

  const handleFieldChange = (
    fieldName: keyof CreateRecordFormData,
    updatedValue: JsonValue,
  ) => {
    const newFormData: CreateRecordFormData = {
      ...formData,
      [fieldName]: updatedValue,
    };

    setFormData(newFormData);

    saveAction(newFormData);
  };

  const saveAction = useDebouncedCallback(
    async (formData: CreateRecordFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      const { objectName: updatedObjectName, ...updatedOtherFields } = formData;

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
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
          dropdownId="workflow-edit-action-record-create-object-name"
          label="Object"
          fullWidth
          disabled={isFormDisabled}
          value={formData.objectName}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(updatedObjectName) => {
            const newFormData: CreateRecordFormData = {
              objectName: updatedObjectName,
            };

            setFormData(newFormData);

            saveAction(newFormData);
          }}
        />

        <HorizontalSeparator noMargin />

        {inlineFieldDefinitions.map((field) => {
          const currentValue = formData[field.metadata.fieldName] as JsonValue;

          return (
            <FormFieldInput
              key={field.metadata.fieldName}
              defaultValue={currentValue}
              field={field}
              onPersist={(value) => {
                handleFieldChange(field.metadata.fieldName, value);
              }}
              VariablePicker={WorkflowVariablePicker}
              readonly={isFormDisabled}
            />
          );
        })}
      </WorkflowStepBody>
    </>
  );
};
