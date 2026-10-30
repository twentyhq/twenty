import { SettingsBillingLimitNestedSelect } from '@/settings/billing/components/internal/SettingsBillingLimitNestedSelect';
import { USAGE_LIMIT_OPERATION_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitOperationTypeIcons';
import { USAGE_LIMIT_RESOURCE_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitResourceTypeIcons';
import { USAGE_LIMIT_RESOURCE_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitResourceTypeLabels';
import { USAGE_OPERATION_TYPE_LABELS } from '@/settings/usage/constants/UsageOperationTypeLabels';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  UsageOperationType,
  type UsageQuotaDefinitionsQuery,
  UsageResourceType,
} from '~/generated-metadata/graphql';

const USAGE_DROPDOWN_ID = 'usage-limit-usage';

type SettingsBillingLimitUsageSelectProps = {
  definitions: UsageQuotaDefinitionsQuery['usageQuotaDefinitions'];
  resourceType: UsageResourceType | null;
  operationType: UsageOperationType | null;
  onChange: (scope: {
    resourceType: UsageResourceType;
    operationType: UsageOperationType;
  }) => void;
};

export const SettingsBillingLimitUsageSelect = ({
  definitions,
  resourceType,
  operationType,
  onChange,
}: SettingsBillingLimitUsageSelectProps) => {
  const { t } = useLingui();

  const getSelectedLabel = (): string => {
    if (!isDefined(resourceType)) {
      return t`Choose a usage`;
    }

    const resourceLabel = t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[resourceType]);

    if (resourceType === UsageResourceType.ALL) {
      return resourceLabel;
    }

    const operationLabel = isDefined(operationType)
      ? t(USAGE_OPERATION_TYPE_LABELS[operationType])
      : t`All operations`;

    return `${resourceLabel} · ${operationLabel}`;
  };

  const hasAllUsageDefinition = definitions.definitions.some(
    (definition) => definition.resourceType === UsageResourceType.ALL,
  );

  const operationDefinitions = definitions.definitions.filter(
    (definition) => definition.resourceType !== UsageResourceType.ALL,
  );

  return (
    <SettingsBillingLimitNestedSelect
      dropdownId={USAGE_DROPDOWN_ID}
      label={t`Usage`}
      selectedLabel={getSelectedLabel()}
      SelectedIcon={
        isDefined(resourceType)
          ? USAGE_LIMIT_RESOURCE_TYPE_ICONS[resourceType]
          : undefined
      }
    >
      <Dropdown.Page id="root">
        <Dropdown.Section>
          {hasAllUsageDefinition && (
            <Dropdown.OptionItem
              selected={resourceType === UsageResourceType.ALL}
              onSelect={() =>
                onChange({
                  resourceType: UsageResourceType.ALL,
                  operationType: UsageOperationType.ALL,
                })
              }
              startIcon={
                <SelectOptionIcon
                  Icon={USAGE_LIMIT_RESOURCE_TYPE_ICONS[UsageResourceType.ALL]}
                />
              }
            >
              {t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[UsageResourceType.ALL])}
            </Dropdown.OptionItem>
          )}
          {operationDefinitions.map((definition) => (
            <Dropdown.ActionItem
              key={definition.resourceType}
              page={definition.resourceType}
              startIcon={
                <SelectOptionIcon
                  Icon={
                    USAGE_LIMIT_RESOURCE_TYPE_ICONS[definition.resourceType]
                  }
                />
              }
            >
              {t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[definition.resourceType])}
            </Dropdown.ActionItem>
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
      {operationDefinitions.map((definition) => (
        <Dropdown.Page
          key={definition.resourceType}
          id={definition.resourceType}
        >
          <Dropdown.Back>
            {t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[definition.resourceType])}
          </Dropdown.Back>
          <Dropdown.Section>
            {definition.allowedOperations.map(
              ({ operationType: candidate }) => (
                <Dropdown.OptionItem
                  key={candidate}
                  selected={
                    resourceType === definition.resourceType &&
                    operationType === candidate
                  }
                  onSelect={() =>
                    onChange({
                      resourceType: definition.resourceType,
                      operationType: candidate,
                    })
                  }
                  startIcon={
                    <SelectOptionIcon
                      Icon={USAGE_LIMIT_OPERATION_TYPE_ICONS[candidate]}
                    />
                  }
                >
                  {t(USAGE_OPERATION_TYPE_LABELS[candidate])}
                </Dropdown.OptionItem>
              ),
            )}
          </Dropdown.Section>
        </Dropdown.Page>
      ))}
    </SettingsBillingLimitNestedSelect>
  );
};
