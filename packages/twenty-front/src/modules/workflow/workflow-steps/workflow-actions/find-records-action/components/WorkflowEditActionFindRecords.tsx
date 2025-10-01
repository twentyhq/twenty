import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { type WorkflowFindRecordsAction } from '@/workflow/types/Workflow';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useEffect, useState } from 'react';

import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowActionFooter } from '@/workflow/workflow-steps/components/WorkflowActionFooter';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowFindRecordsFilters } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsFilters';
import { WorkflowFindRecordsFiltersEffect } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsFiltersEffect';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { useLingui } from '@lingui/react/macro';
import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';

type WorkflowEditActionFindRecordsProps = {
  action: WorkflowFindRecordsAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowFindRecordsAction) => void;
      };
};

type FindRecordsFormData = {
  objectNameSingular: string;
  filter?: FindRecordsActionFilter;
  limit?: number;
};

export type FindRecordsActionFilter = {
  recordFilterGroups?: RecordFilterGroup[];
  recordFilters?: RecordFilter[];
  gqlOperationFilter?: JsonValue;
};

export const WorkflowEditActionFindRecords = ({
  action,
  actionOptions,
}: WorkflowEditActionFindRecordsProps) => {
  const { getIcon } = useIcons();
  const { t } = useLingui();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeNonSystemObjectMetadataItems.map((item) => ({
      Icon: getIcon(item.icon),
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  const [formData, setFormData] = useState<FindRecordsFormData>({
    objectNameSingular: action.settings.input.objectName,
    limit: action.settings.input.limit,
    filter: action.settings.input.filter as FindRecordsActionFilter,
  });
  const isFormDisabled = actionOptions.readonly;
  const instanceId = `workflow-edit-action-record-find-records-${action.id}-${formData.objectNameSingular}`;

  const selectedObjectMetadataItem = activeNonSystemObjectMetadataItems.find(
    (item) => item.nameSingular === formData.objectNameSingular,
  );

  const selectedObjectMetadataItemNameSingular =
    selectedObjectMetadataItem?.nameSingular ?? '';

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const {
    fieldDefinitionByFieldMetadataItemId,
    fieldMetadataItemByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
    recordFieldByFieldMetadataItemId,
  } = useRecordIndexFieldMetadataDerivedStates(
    selectedObjectMetadataItem,
    instanceId,
  );

  const saveAction = useDebouncedCallback(
    async (formData: FindRecordsFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      const {
        objectNameSingular: updatedObjectName,
        limit: updatedLimit,
        filter: updatedFilter,
      } = formData;

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            objectName: updatedObjectName,
            limit: updatedLimit ?? 1,
            filter: updatedFilter,
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
      defaultTitle: 'Search Records',
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
          dropdownId="workflow-edit-action-record-find-records-object-name"
          label="Object"
          fullWidth
          disabled={isFormDisabled}
          value={selectedObjectMetadataItemNameSingular}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(objectNameSingular) => {
            const newFormData: FindRecordsFormData = {
              objectNameSingular,
              limit: 1,
            };

            setFormData(newFormData);

            saveAction(newFormData);
          }}
          withSearchInput
        />

        <HorizontalSeparator noMargin />
        {isDefined(selectedObjectMetadataItem) && (
          <div>
            <InputLabel>{t`Conditions`}</InputLabel>
            <RecordIndexContextProvider
              value={{
                indexIdentifierUrl: () => '',
                onIndexRecordsLoaded: () => {},
                objectNamePlural: selectedObjectMetadataItem.labelPlural,
                objectNameSingular: selectedObjectMetadataItem.nameSingular,
                objectMetadataItem: selectedObjectMetadataItem,
                recordIndexId: instanceId,
                viewBarInstanceId: instanceId,
                objectPermissionsByObjectMetadataId,
                labelIdentifierFieldMetadataItem,
                recordFieldByFieldMetadataItemId,
                fieldDefinitionByFieldMetadataItemId,
                fieldMetadataItemByFieldMetadataItemId,
              }}
            >
              <RecordFilterGroupsComponentInstanceContext.Provider
                value={{ instanceId }}
              >
                <RecordFiltersComponentInstanceContext.Provider
                  value={{ instanceId }}
                >
                  <WorkflowFindRecordsFilters
                    objectMetadataItem={selectedObjectMetadataItem}
                    onChange={(filter: FindRecordsActionFilter) => {
                      if (isFormDisabled === true) {
                        return;
                      }

                      const newFormData: FindRecordsFormData = {
                        ...formData,
                        filter,
                      };

                      setFormData(newFormData);

                      saveAction(newFormData);
                    }}
                    readonly={isFormDisabled}
                  />
                  <WorkflowFindRecordsFiltersEffect
                    defaultValue={formData.filter}
                  />
                </RecordFiltersComponentInstanceContext.Provider>
              </RecordFilterGroupsComponentInstanceContext.Provider>
            </RecordIndexContextProvider>
          </div>
        )}

        <FormNumberFieldInput
          label="Limit"
          defaultValue={formData.limit}
          placeholder="Enter limit"
          onChange={(limit) => {
            if (isFormDisabled === true || !isNumber(limit)) {
              return;
            }

            const newFormData: FindRecordsFormData = {
              ...formData,
              limit,
            };

            setFormData(newFormData);

            saveAction(newFormData);
          }}
        />
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowActionFooter stepId={action.id} />}
    </>
  );
};
