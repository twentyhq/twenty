import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useViewOrDefaultViewFromPrefetchedViews } from '@/views/hooks/useViewOrDefaultViewFromPrefetchedViews';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { type WorkflowUpsertRecordAction } from '@/workflow/types/Workflow';
import { WorkflowActionFooter } from '@/workflow/workflow-steps/components/WorkflowActionFooter';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { RelationType } from '~/generated-metadata/graphql';

type WorkflowEditActionUpsertRecordProps = {
  action: WorkflowUpsertRecordAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowUpsertRecordAction) => void;
      };
};

type RelationManyToOneField = {
  id: string;
};

type UpsertRecordFormData = {
  objectName: string;
  matchFields: string[];
  fieldsToUpdate?: string[];
} & Record<string, RelationManyToOneField | JsonValue>;

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

export const WorkflowEditActionUpsertRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionUpsertRecordProps) => {
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

  const [formData, setFormData] = useState<UpsertRecordFormData>(() => {
    const baseFormData: UpsertRecordFormData = {
      objectName: action.settings.input.objectName,
      matchFields: action.settings.input.upsertCriteria.matchFields || [],
      ...(action.settings.input.fieldsToUpdate && {
        fieldsToUpdate: action.settings.input.fieldsToUpdate,
      }),
      ...action.settings.input.objectRecord,
    };
    return baseFormData;
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

  const inlineFieldMetadataItems = () => {
    if (!objectMetadataItem?.fields) return [];

    return objectMetadataItem.fields
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
  };

  const inlineFieldDefinitions = () => {
    if (!isDefined(objectMetadataItem) || !inlineFieldMetadataItems) return [];

    return inlineFieldMetadataItems().map((fieldMetadataItem) =>
      formatFieldMetadataItemAsFieldDefinition({
        field: fieldMetadataItem,
        objectMetadataItem,
        showLabel: true,
        labelWidth: 90,
      }),
    );
  };

  const handleFieldChange = (
    fieldName: keyof UpsertRecordFormData,
    updatedValue: JsonValue,
  ) => {
    if (fieldName === 'matchFields' || fieldName === 'fieldsToUpdate') {
      const newFormData: UpsertRecordFormData = {
        ...formData,
        [fieldName]: updatedValue,
      };

      setFormData(newFormData);
      saveAction(newFormData);
      return;
    }

    const fieldDefinition = inlineFieldDefinitions()?.find(
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

    const newFormData: UpsertRecordFormData = {
      ...formData,
      [fieldName]: fieldValue,
    };

    setFormData(newFormData);

    saveAction(newFormData);
  };

  const saveAction = useDebouncedCallback(
    async (formData: UpsertRecordFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      const {
        objectName: updatedObjectName,
        matchFields,
        fieldsToUpdate,
        ...updatedOtherFields
      } = formData;

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            objectName: updatedObjectName,
            objectRecord: updatedOtherFields,
            upsertCriteria: {
              matchFields: matchFields || [],
            },
            fieldsToUpdate,
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
      defaultTitle: 'Upsert Record',
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
          dropdownId="workflow-edit-action-record-create-or-update-object-name"
          label="Object"
          fullWidth
          disabled={isFormDisabled}
          value={formData.objectName}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(updatedObjectName) => {
            const newFormData: UpsertRecordFormData = {
              objectName: updatedObjectName,
              matchFields: [],
              ...(formData.fieldsToUpdate !== undefined && {
                fieldsToUpdate: [],
              }),
            };

            setFormData(newFormData);

            saveAction(newFormData);
          }}
          withSearchInput
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />

        <HorizontalSeparator noMargin />

        {isDefined(objectMetadataItem) && (
          <WorkflowFieldsMultiSelect
            label="Match Fields (Required)"
            placeholder="Select fields to match on"
            objectMetadataItem={objectMetadataItem}
            handleFieldsChange={(matchFields) =>
              handleFieldChange('matchFields', matchFields)
            }
            readonly={isFormDisabled ?? false}
            defaultFields={formData.matchFields}
          />
        )}

        <HorizontalSeparator noMargin />

        {isDefined(objectMetadataItem) && (
          <WorkflowFieldsMultiSelect
            label="Fields to Update (Optional)"
            placeholder="Update all fields"
            objectMetadataItem={objectMetadataItem}
            handleFieldsChange={(fieldsToUpdate) =>
              handleFieldChange('fieldsToUpdate', fieldsToUpdate)
            }
            readonly={isFormDisabled ?? false}
            defaultFields={formData.fieldsToUpdate || []}
          />
        )}

        <HorizontalSeparator noMargin />

        {inlineFieldDefinitions()?.map((fieldDefinition) => {
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
      {!actionOptions.readonly && <WorkflowActionFooter stepId={action.id} />}
    </>
  );
};
