import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useViewOrDefaultViewFromPrefetchedViews } from '@/views/hooks/useViewOrDefaultViewFromPrefetchedViews';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
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

export type CreateRecordFormData = {
  objectName: string;
  [field: string]: RelationManyToOneField | JsonValue;
};

type WorkflowCreateRecordBodyProps = {
  defaultObjectName: string;
  defaultObjectRecord: Record<string, unknown>;
  readonly: boolean;
  actionType: 'CREATE_RECORD' | 'UPSERT_RECORD';
  onUpdate: (formData: CreateRecordFormData) => void;
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

export const WorkflowCreateRecordBody = ({
  defaultObjectName,
  defaultObjectRecord,
  readonly,
  actionType,
  onUpdate,
}: WorkflowCreateRecordBodyProps) => {
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

  const [formData, setFormData] = useState<CreateRecordFormData>({
    objectName: defaultObjectName,
    ...defaultObjectRecord,
  });

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
      shouldDisplayFormField({ fieldMetadataItem, actionType }),
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

  const uniqueFieldMetadataItems = inlineFieldMetadataItems?.filter(
    (fieldMetadataItem) => fieldMetadataItem.isUnique,
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
      if (readonly === true) {
        return;
      }

      const { objectName: updatedObjectName, ...updatedOtherFields } = formData;

      onUpdate({
        objectName: updatedObjectName,
        ...updatedOtherFields,
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
    <WorkflowStepBody>
      <Select
        dropdownId="workflow-create-record-object-name"
        label="Object"
        fullWidth
        disabled={readonly}
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

      {actionType === 'UPSERT_RECORD' &&
        isDefined(objectMetadataItem) &&
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
          />
        )}

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
            readonly={readonly}
          />
        );
      })}
    </WorkflowStepBody>
  );
};
