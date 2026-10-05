import { SettingsBillingLimitNestedSelect } from '@/settings/billing/components/internal/SettingsBillingLimitNestedSelect';
import { USAGE_LIMIT_OPERATION_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitOperationTypeIcons';
import { USAGE_LIMIT_RESOURCE_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitResourceTypeIcons';
import { USAGE_LIMIT_RESOURCE_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitResourceTypeLabels';
import { USAGE_OPERATION_TYPE_LABELS } from '@/settings/usage/constants/UsageOperationTypeLabels';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import {
  type UsageOperationType,
  type UsageQuotaDefinitionsQuery,
  type UsageResourceType,
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

  const operationLabel = isDefined(operationType)
    ? t(USAGE_OPERATION_TYPE_LABELS[operationType])
    : t`All operations`;

  const selectedLabel = isDefined(resourceType)
    ? `${t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[resourceType])} · ${operationLabel}`
    : t`Choose a usage`;

  return (
    <SettingsBillingLimitNestedSelect
      dropdownId={USAGE_DROPDOWN_ID}
      label={t`Usage`}
      selectedLabel={selectedLabel}
      SelectedIcon={
        isDefined(resourceType)
          ? USAGE_LIMIT_RESOURCE_TYPE_ICONS[resourceType]
          : undefined
      }
    >
      <Dropdown.Page id="root">
        <Dropdown.Section>
          {definitions.definitions.map((definition) => (
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
      {definitions.definitions.map((definition) => (
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
