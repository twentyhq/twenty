import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useViewOrDefaultViewFromPrefetchedViews } from '@/views/hooks/useViewOrDefaultViewFromPrefetchedViews';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { type WorkflowUpsertRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { RelationType } from '~/generated-metadata/graphql';

type RelationManyToOneField = {
  id: string;
};

type UpsertRecordFormData = {
  objectName: string;
  [field: string]: RelationManyToOneField | JsonValue;
};

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

const sortFieldsWithIdFirst = (
  a: { name: string; viewFieldPosition?: number },
  b: { name: string; viewFieldPosition?: number },
) => {
  if (a.name === 'id') {
    return -1;
  }

  if (b.name === 'id') {
    return 1;
  }

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

  const [formData, setFormData] = useState<UpsertRecordFormData>({
    objectName: action.settings.input.objectName,
    ...action.settings.input.objectRecord,
  });

  const isFormDisabled = actionOptions.readonly === true;

  const objectNameSingular = formData.objectName;

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  const objectLabelSingular = objectMetadataItem?.labelSingular;

  const { view: indexView } = useViewOrDefaultViewFromPrefetchedViews({
    objectMetadataItemId: objectMetadataItem?.id ?? '',
  });

  const viewFields = indexView?.viewFields ?? [];

  const inlineFieldMetadataItems = objectMetadataItem?.fields
    .filter((fieldMetadataItem) =>
      shouldDisplayFormField({
        fieldMetadataItem,
        actionType: 'UPSERT_RECORD',
      }),
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
    .sort(sortFieldsWithIdFirst);

  const uniqueFieldMetadataItems = inlineFieldMetadataItems?.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.isUnique || fieldMetadataItem.name === 'id',
  );

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
    fieldName: keyof UpsertRecordFormData,
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

  return (
    <>
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-upsert-record-object-name"
          label={t`Object`}
          fullWidth
          disabled={isFormDisabled}
          value={formData.objectName}
          emptyOption={{ label: t`Select an option`, value: '' }}
          options={availableMetadata}
          onChange={(updatedObjectName) => {
            const newFormData: UpsertRecordFormData = {
              objectName: updatedObjectName,
            };

            setFormData(newFormData);

            saveAction(newFormData);
          }}
          withSearchInput
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />

        {isDefined(objectMetadataItem) &&
          isDefined(uniqueFieldMetadataItems) &&
          uniqueFieldMetadataItems.length > 0 && (
            <WorkflowFieldsMultiSelect
              label={t`Unique fields`}
              objectMetadataItem={objectMetadataItem}
              handleFieldsChange={() => {}}
              defaultFields={
                uniqueFieldMetadataItems?.map(
                  (fieldMetadataItem) => fieldMetadataItem.name,
                ) ?? []
              }
              placeholder={t`Object unique fields`}
              readonly
              hint={t`We match on these fields. If a ${objectLabelSingular} already exists, we update it. Otherwise, we create a new one.`}
              actionType="UPSERT_RECORD"
            />
          )}

        <HorizontalSeparator noMargin />

        {inlineFieldDefinitions?.map((fieldDefinition) => {
          const isIdField = fieldDefinition.metadata.fieldName === 'id';

          if (isIdField) {
            return (
              <FormSingleRecordPicker
                key="id"
                testId="workflow-upsert-record-id"
                label={t`Record (ID)`}
                onChange={(recordId) => {
                  handleFieldChange('id', recordId);
                }}
                objectNameSingulars={
                  isDefined(objectNameSingular) ? [objectNameSingular] : []
                }
                defaultValue={(formData.id as string) ?? ''}
                disabled={isFormDisabled}
                VariablePicker={WorkflowVariablePicker}
              />
            );
          }

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
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
