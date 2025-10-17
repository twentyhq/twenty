import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useViewOrDefaultViewFromPrefetchedViews } from '@/views/hooks/useViewOrDefaultViewFromPrefetchedViews';
import {
  type WorkflowCreateRecordAction,
  type WorkflowUpsertRecordAction,
} from '@/workflow/types/Workflow';
import { WorkflowActionFooter } from '@/workflow/workflow-steps/components/WorkflowActionFooter';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { useEffect, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { RelationType } from '~/generated-metadata/graphql';
import { WorkflowFieldsMultiSelect } from '../../../components/WorkflowEditUpdateEventFieldsMultiSelect';

type WorkflowEditActionCreateRecordProps = {
  action: WorkflowCreateRecordAction | WorkflowUpsertRecordAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (
          action: WorkflowCreateRecordAction | WorkflowUpsertRecordAction,
        ) => void;
      };
  mode?: 'create' | 'upsert';
};

type RelationManyToOneField = {
  id: string;
};

type CreateRecordFormData = {
  objectName: string;
  [field: string]: RelationManyToOneField | JsonValue;
};

type UpsertRecordFormData = CreateRecordFormData & {
  matchFields: string[];
  fieldsToUpdate?: string[];
};

export const WorkflowEditActionCreateRecord = ({
  action,
  actionOptions,
  mode = 'create',
}: WorkflowEditActionCreateRecordProps) => {
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

  const [formData, setFormData] = useState<
    CreateRecordFormData | UpsertRecordFormData
  >(() => {
    const baseFormData = {
      objectName: action.settings.input.objectName,
      ...action.settings.input.objectRecord,
    };

    if (mode === 'upsert') {
      const upsertInput = action.settings.input as {
        objectName: string;
        objectRecord: Record<string, JsonValue>;
        upsertCriteria?: { matchFields: string[] };
        fieldsToUpdate?: string[];
      };

      const upsertFormData: UpsertRecordFormData = {
        ...baseFormData,
        matchFields: upsertInput.upsertCriteria?.matchFields || ['id'],
        fieldsToUpdate: upsertInput.fieldsToUpdate || [],
      };
      return upsertFormData;
    }

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
      .sort((a, b) => {
        if (isDefined(a.viewFieldPosition) && isDefined(b.viewFieldPosition)) {
          return a.viewFieldPosition - b.viewFieldPosition;
        }
        if (isDefined(a.viewFieldPosition)) return -1;
        if (isDefined(b.viewFieldPosition)) return 1;
        return 0;
      });
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

  const handleFieldChange = (
    fieldName: keyof (CreateRecordFormData | UpsertRecordFormData),
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

    const newFormData = {
      ...formData,
      [fieldName]: fieldValue,
    };

    setFormData(newFormData);
    saveAction(newFormData);
  };

  const saveAction = useDebouncedCallback(
    async (formData: CreateRecordFormData | UpsertRecordFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      if (mode === 'upsert') {
        const upsertFormData = formData as UpsertRecordFormData;

        if (
          !upsertFormData.matchFields ||
          upsertFormData.matchFields.length === 0
        ) {
          return;
        }

        actionOptions.onActionUpdate({
          ...action,
          settings: {
            ...action.settings,
            input: {
              objectName: upsertFormData.objectName,
              objectRecord: Object.fromEntries(
                Object.entries(upsertFormData).filter(
                  ([key]) =>
                    !['objectName', 'matchFields', 'fieldsToUpdate'].includes(
                      key,
                    ),
                ),
              ),
              upsertCriteria: {
                matchFields: upsertFormData.matchFields,
              },
              fieldsToUpdate: upsertFormData.fieldsToUpdate,
            },
          },
        } as WorkflowCreateRecordAction | WorkflowUpsertRecordAction);
      } else {
        actionOptions.onActionUpdate({
          ...action,
          settings: {
            ...action.settings,
            input: {
              objectName: formData.objectName,
              objectRecord: Object.fromEntries(
                Object.entries(formData).filter(
                  ([key]) => key !== 'objectName',
                ),
              ),
            },
          },
        } as WorkflowCreateRecordAction | WorkflowUpsertRecordAction);
      }
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
      defaultTitle: mode === 'upsert' ? 'Upsert Record' : 'Create Record',
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
          dropdownId={`workflow-edit-action-${mode}-object-name`}
          label="Object"
          fullWidth
          disabled={isFormDisabled}
          value={formData.objectName}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(updatedObjectName) => {
            const newFormData = {
              objectName: updatedObjectName,
            } as CreateRecordFormData | UpsertRecordFormData;

            setFormData(newFormData);
            saveAction(newFormData);
          }}
          withSearchInput
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />

        <HorizontalSeparator noMargin />

        {mode === 'upsert' && objectMetadataItem && (
          <>
            <WorkflowFieldsMultiSelect
              label="Match Fields (Required)"
              placeholder="Select fields to match on"
              objectMetadataItem={objectMetadataItem}
              handleFieldsChange={(matchFields) =>
                handleFieldChange('matchFields', matchFields)
              }
              readonly={isFormDisabled ?? false}
              defaultFields={(formData as UpsertRecordFormData).matchFields}
            />

            <HorizontalSeparator noMargin />

            <WorkflowFieldsMultiSelect
              label="Fields to Update (Optional)"
              placeholder="Update all fields"
              objectMetadataItem={objectMetadataItem}
              handleFieldsChange={(fieldsToUpdate) =>
                handleFieldChange('fieldsToUpdate', fieldsToUpdate)
              }
              readonly={isFormDisabled ?? false}
              defaultFields={
                (formData as UpsertRecordFormData).fieldsToUpdate || []
              }
            />

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
                  fieldDefinition.metadata.fieldName as keyof (
                    | CreateRecordFormData
                    | UpsertRecordFormData
                  ),
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
