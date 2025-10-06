import { useState } from 'react';
import { HorizontalSeparator } from 'twenty-ui/display';
import { type JsonValue } from 'type-fest';
import { WorkflowFieldsMultiSelect } from '../../../components/WorkflowEditUpdateEventFieldsMultiSelect';
import { type WorkflowUpsertRecordAction } from '../../../types/Workflow';
import {
  WorkflowEditActionRecordBase,
  type UpsertRecordFormData,
} from './WorkflowEditActionRecordBase';

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

export const WorkflowEditActionUpsertRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionUpsertRecordProps) => {
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

  const renderUpsertFields = ({
    objectMetadataItem,
    formData,
    handleFieldChange,
    isFormDisabled,
  }: {
    objectMetadataItem: any;
    formData: UpsertRecordFormData;
    handleFieldChange: (
      fieldName: keyof UpsertRecordFormData,
      value: JsonValue,
    ) => void;
    isFormDisabled: boolean;
  }) => {
    if (!objectMetadataItem) return null;

    return (
      <>
        <WorkflowFieldsMultiSelect
          label="Match Fields (Required)"
          placeholder="Select fields to match on"
          objectMetadataItem={objectMetadataItem}
          handleFieldsChange={(matchFields) =>
            handleFieldChange('matchFields', matchFields)
          }
          readonly={isFormDisabled}
          defaultFields={formData.matchFields}
        />

        <HorizontalSeparator noMargin />

        <WorkflowFieldsMultiSelect
          label="Fields to Update (Optional)"
          placeholder="Update all fields"
          objectMetadataItem={objectMetadataItem}
          handleFieldsChange={(fieldsToUpdate) =>
            handleFieldChange('fieldsToUpdate', fieldsToUpdate)
          }
          readonly={isFormDisabled}
          defaultFields={formData.fieldsToUpdate || []}
        />
      </>
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
      saveUpsertAction(newFormData);
      return;
    }

    const newFormData = {
      ...formData,
      [fieldName]: updatedValue,
    };

    setFormData(newFormData);
    saveUpsertAction(newFormData);
  };

  const saveUpsertAction = (formData: UpsertRecordFormData) => {
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
  };

  return (
    <WorkflowEditActionRecordBase
      mode="upsert"
      action={action}
      actionOptions={actionOptions}
      formData={formData}
      setFormData={setFormData}
      defaultTitle="Upsert Record"
      renderUpsertFields={renderUpsertFields}
      onFieldChange={handleFieldChange}
    />
  );
};
