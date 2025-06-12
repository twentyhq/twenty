import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { WorkflowFindRecordsAction } from '@/workflow/types/Workflow';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useEffect, useState } from 'react';

import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowFindRecordsFilters } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsFilters';
import { WorkflowFindRecordsFiltersEffect } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsFiltersEffect';
import { useActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionHeaderTypeOrThrow';
import { useActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionIconColorOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { JsonValue } from 'type-fest';
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
  objectName: string;
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
    objectName: action.settings.input.objectName,
    limit: action.settings.input.limit,
    filter: action.settings.input.filter as FindRecordsActionFilter,
  });
  const isFormDisabled = actionOptions.readonly;

  const selectedObjectMetadataItem = activeNonSystemObjectMetadataItems.find(
    (item) => item.nameSingular === formData.objectName,
  );

  const selectedObjectMetadataItemNameSingular =
    selectedObjectMetadataItem?.nameSingular ?? '';

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const saveAction = useDebouncedCallback(
    async (formData: FindRecordsFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      const {
        objectName: updatedObjectName,
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

  const headerTitle = isDefined(action.name) ? action.name : `Search Records`;
  const headerIcon = getActionIcon(action.type);
  const headerIconColor = useActionIconColorOrThrow(action.type);
  const headerType = useActionHeaderTypeOrThrow(action.type);
  const instanceId = `workflow-edit-action-record-find-records-${action.id}-${formData.objectName}`;

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
          onChange={(objectName) => {
            const newFormData: FindRecordsFormData = {
              objectName,
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
                objectPermissionsByObjectMetadataId,
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
                      const newFormData: FindRecordsFormData = {
                        ...formData,
                        filter,
                      };

                      setFormData(newFormData);

                      saveAction(newFormData);
                    }}
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
          onChange={() => {}}
          readonly
        />
      </WorkflowStepBody>
    </>
  );
};
