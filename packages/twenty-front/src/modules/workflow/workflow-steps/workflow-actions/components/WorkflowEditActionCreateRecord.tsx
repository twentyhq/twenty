import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/components/FormFieldInput';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useViewOrDefaultViewFromPrefetchedViews } from '@/views/hooks/useViewOrDefaultViewFromPrefetchedViews';
import { WorkflowCreateRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { RelationType } from '~/generated-metadata/graphql';

type WorkflowEditActionCreateRecordProps = {
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

type RelationManyToOneField = {
  id: string;
};

type CreateRecordFormData = {
  objectName: string;
  [field: string]: RelationManyToOneField | JsonValue;
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

export const WorkflowEditActionCreateRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionCreateRecordProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeNonSystemObjectMetadataItems.map((item) => ({
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

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  const { view: indexView } = useViewOrDefaultViewFromPrefetchedViews({
    objectMetadataItemId: objectMetadataItem?.id ?? '',
  });

  const viewFields = indexView?.viewFields ?? [];

  const inlineFieldMetadataItems = objectMetadataItem?.fields
    .filter((fieldMetadataItem) =>
      shouldDisplayFormField({ fieldMetadataItem, actionType: action.type }),
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

  const inlineFieldDefinitions = isDefined(objectMetadataItem)
    ? inlineFieldMetadataItems?.map((fieldMetadataItem) =>
        formatFieldMetadataItemAsFieldDefinition({
          field: fieldMetadataItem,
          objectMetadataItem,
          showLabel: true,
          labelWidth: 90,
        }),
      )
    : [];

  const handleFieldChange = (
    fieldName: keyof CreateRecordFormData,
    updatedValue: JsonValue,
  ) => {
    const fieldDefinition = inlineFieldDefinitions?.find(
      (definition) => definition.metadata.fieldName === fieldName,
    );

    if (!isDefined(fieldDefinition)) {
      return;
    }

    const isFieldRelationManyToOne =
      isFieldRelation(fieldDefinition) &&
      fieldDefinition.metadata.relationType === RelationType.MANY_TO_ONE;

    const fieldValue = isFieldRelationManyToOne
      ? {
          id: updatedValue,
        }
      : updatedValue;

    const newFormData: CreateRecordFormData = {
      ...formData,
      [fieldName]: fieldValue,
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

  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'Create Record',
    });

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
          withSearchInput
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />

        <HorizontalSeparator noMargin />

        {inlineFieldDefinitions?.map((fieldDefinition) => {
          const isFieldRelationManyToOne =
            isFieldRelation(fieldDefinition) &&
            fieldDefinition.metadata.relationType === RelationType.MANY_TO_ONE;

          const currentValue = isFieldRelationManyToOne
            ? (
                formData[
                  fieldDefinition.metadata.fieldName
                ] as RelationManyToOneField
              )?.id
            : (formData[fieldDefinition.metadata.fieldName] as JsonValue);

          return (
            <FormFieldInput
              key={fieldDefinition.metadata.fieldName}
              defaultValue={currentValue}
              field={fieldDefinition}
              onChange={(value) => {
                handleFieldChange(fieldDefinition.metadata.fieldName, value);
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
