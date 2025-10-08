import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useViewOrDefaultViewFromPrefetchedViews } from '@/views/hooks/useViewOrDefaultViewFromPrefetchedViews';
import { WorkflowActionFooter } from '@/workflow/workflow-steps/components/WorkflowActionFooter';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { useTheme } from '@emotion/react';
import { useEffect, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { RelationType } from '~/generated-metadata/graphql';
import { WorkflowVariablePicker } from '../../../workflow-variables/components/WorkflowVariablePicker';
import { useWorkflowActionHeader } from '../hooks/useWorkflowActionHeader';
import { shouldDisplayFormField } from '../utils/shouldDisplayFormField';

export type RecordActionMode = 'create' | 'upsert';

type RelationManyToOneField = {
  id: string;
};

type BaseRecordFormData = {
  objectName: string;
  [field: string]: RelationManyToOneField | JsonValue;
};

export type UpsertRecordFormData = BaseRecordFormData & {
  matchFields: string[];
  fieldsToUpdate?: string[];
};

type WorkflowEditActionRecordBaseProps<T extends BaseRecordFormData> = {
  mode: RecordActionMode;
  action: any;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: any) => void;
      };
  formData: T;
  setFormData: (data: T) => void;
  defaultTitle: string;
  renderUpsertFields?: (props: {
    objectMetadataItem: any;
    formData: UpsertRecordFormData;
    handleFieldChange: (
      fieldName: keyof UpsertRecordFormData,
      value: JsonValue,
    ) => void;
    isFormDisabled: boolean;
  }) => React.ReactNode;
  onFieldChange?: (fieldName: keyof T, value: JsonValue) => void;
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

export const WorkflowEditActionRecordBase = <T extends BaseRecordFormData>({
  mode,
  action,
  actionOptions,
  formData,
  setFormData,
  defaultTitle,
  renderUpsertFields,
  onFieldChange,
}: WorkflowEditActionRecordBaseProps<T>) => {
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

  const isFormDisabled = actionOptions.readonly;
  const objectNameSingular = formData.objectName;

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  const { view: indexView } = useViewOrDefaultViewFromPrefetchedViews({
    objectMetadataItemId: objectMetadataItem?.id ?? '',
  });

  const inlineFieldMetadataItems = useMemo(() => {
    if (!objectMetadataItem?.fields) return [];

    const viewFields = indexView?.viewFields ?? [];

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
  }, [objectMetadataItem, indexView, action.type]);

  const inlineFieldDefinitions = useMemo(() => {
    if (!isDefined(objectMetadataItem) || !inlineFieldMetadataItems) return [];

    return inlineFieldMetadataItems.map((fieldMetadataItem) =>
      formatFieldMetadataItemAsFieldDefinition({
        field: fieldMetadataItem,
        objectMetadataItem,
        showLabel: true,
        labelWidth: 90,
      }),
    );
  }, [objectMetadataItem, inlineFieldMetadataItems]);

  const handleFieldChange = (fieldName: keyof T, updatedValue: JsonValue) => {
    if (onFieldChange !== undefined) {
      onFieldChange(fieldName, updatedValue);
      return;
    }

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

    const newFormData = {
      ...formData,
      [fieldName]: fieldValue,
    };

    setFormData(newFormData);
    saveAction(newFormData);
  };

  const saveAction = useDebouncedCallback(async (formData: T) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          objectName: formData.objectName,
          objectRecord: Object.fromEntries(
            Object.entries(formData).filter(([key]) => key !== 'objectName'),
          ),
        },
      },
    });
  }, 1_000);

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle,
    });

  return (
    <>
      <SidePanelHeader
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
          dropdownId={`workflow-edit-action-record-${mode}-object-name`}
          label="Object"
          fullWidth
          disabled={isFormDisabled}
          value={formData.objectName}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(updatedObjectName) => {
            const newFormData = {
              objectName: updatedObjectName,
            } as T;

            setFormData(newFormData);
            saveAction(newFormData);
          }}
          withSearchInput
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />

        <HorizontalSeparator noMargin />

        {mode === 'upsert' && renderUpsertFields && (
          <>
            {renderUpsertFields({
              objectMetadataItem,
              formData: formData as unknown as UpsertRecordFormData,
              handleFieldChange: handleFieldChange as unknown as (
                fieldName: keyof UpsertRecordFormData,
                value: JsonValue,
              ) => void,
              isFormDisabled: isFormDisabled ?? false,
            })}
            <HorizontalSeparator noMargin />
          </>
        )}

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
                handleFieldChange(
                  fieldDefinition.metadata.fieldName as keyof T,
                  value,
                );
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
