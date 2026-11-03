import { useCoreAgentTrigger } from '@/object-core/agents/hooks/useCoreAgentTrigger';
import { updateCoreAgentDatabaseEvent } from '@/object-core/agents/utils/updateCoreAgentDatabaseEvent';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItemSelectOptions } from '@/object-metadata/hooks/useObjectMetadataItemSelectOptions';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { useLingui } from '@lingui/react/macro';
import { isArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type CoreAgentDatabaseTriggerFieldsProps = {
  agentId: string;
  triggerId: string;
  disabled: boolean;
};

export const CoreAgentDatabaseTriggerFields = ({
  agentId,
  triggerId,
  disabled,
}: CoreAgentDatabaseTriggerFieldsProps) => {
  const { t } = useLingui();
  const { trigger, updateTrigger } = useCoreAgentTrigger({
    agentId,
    triggerId,
  });
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const eventName =
    trigger?.type === 'DATABASE_EVENT' ? trigger.settings.eventName : '';
  const [objectNameSingular = '', action = 'created'] = eventName.split('.');
  const objectOptions = useObjectMetadataItemSelectOptions({
    selectedObjectNameSingular: objectNameSingular,
  });
  const selectedObjectOptions =
    isNonEmptyString(objectNameSingular) &&
    !objectOptions.some((option) => option.value === objectNameSingular)
      ? [
          {
            label: objectNameSingular,
            value: objectNameSingular,
            disabled: true,
          },
          ...objectOptions,
        ]
      : objectOptions;
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  if (trigger?.type !== 'DATABASE_EVENT') {
    return null;
  }

  return (
    <>
      <Select
        dropdownId={`agent-trigger-object-${triggerId}`}
        label={t`Record type`}
        fullWidth
        disabled={disabled}
        value={objectNameSingular}
        options={selectedObjectOptions}
        withSearchInput
        dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        onChange={(value) =>
          updateTrigger((current) =>
            current.type === 'DATABASE_EVENT'
              ? updateCoreAgentDatabaseEvent({
                  trigger: current,
                  objectNameSingular: value,
                  action,
                })
              : current,
          )
        }
      />
      <Select
        dropdownId={`agent-trigger-action-${triggerId}`}
        label={t`Event`}
        fullWidth
        disabled={disabled}
        value={action}
        options={[
          { label: t`Created`, value: 'created' },
          { label: t`Updated`, value: 'updated' },
          { label: t`Created or updated`, value: 'upserted' },
          { label: t`Deleted`, value: 'deleted' },
          { label: t`Permanently deleted`, value: 'destroyed' },
          { label: t`Restored`, value: 'restored' },
        ]}
        onChange={(value) =>
          updateTrigger((current) =>
            current.type === 'DATABASE_EVENT'
              ? updateCoreAgentDatabaseEvent({
                  trigger: current,
                  objectNameSingular,
                  action: value,
                })
              : current,
          )
        }
      />
      {action === 'updated' && isDefined(objectMetadataItem) && (
        <WorkflowFieldsMultiSelect
          key={objectNameSingular}
          label={t`Fields (optional)`}
          placeholder={t`Only run when one of these fields changes`}
          objectMetadataItem={objectMetadataItem}
          readonly={disabled}
          defaultFields={trigger.settings.updatedFields}
          actionType="DATABASE_EVENT"
          handleFieldsChange={(fields) => {
            const fieldNames = isArray(fields)
              ? fields
              : isDefined(fields)
                ? [fields]
                : [];
            updateTrigger((current) =>
              current.type === 'DATABASE_EVENT'
                ? {
                    ...current,
                    settings: {
                      ...current.settings,
                      updatedFields:
                        fieldNames.length > 0 ? fieldNames : undefined,
                    },
                  }
                : current,
            );
          }}
        />
      )}
    </>
  );
};
