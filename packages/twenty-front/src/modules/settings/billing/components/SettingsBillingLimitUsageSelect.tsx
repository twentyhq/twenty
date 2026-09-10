import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';

import { SettingsBillingLimitNestedSelect } from '@/settings/billing/components/internal/SettingsBillingLimitNestedSelect';
import { USAGE_LIMIT_OPERATION_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitOperationTypeIcons';
import { USAGE_LIMIT_RESOURCE_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitResourceTypeIcons';
import { USAGE_LIMIT_RESOURCE_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitResourceTypeLabels';
import { getUsageLimitOperationTypes } from '@/settings/billing/utils/getUsageLimitOperationTypes';
import { USAGE_OPERATION_TYPE_LABELS } from '@/settings/usage/constants/UsageOperationTypeLabels';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
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
  const { closeDropdown } = useCloseDropdown();

  const [browsedResourceType, setBrowsedResourceType] =
    useState<UsageResourceType | null>(null);

  const browsedDefinition = definitions.definitions.find(
    (definition) => definition.resourceType === browsedResourceType,
  );

  const handleSelect = (nextOperationType: UsageOperationType) => {
    if (!isDefined(browsedResourceType)) {
      return;
    }

    onChange({
      resourceType: browsedResourceType,
      operationType: nextOperationType,
    });
    setBrowsedResourceType(null);
    closeDropdown(USAGE_DROPDOWN_ID);
  };

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
      onClose={() => setBrowsedResourceType(null)}
      dropdownComponents={
        isDefined(browsedResourceType) && isDefined(browsedDefinition) ? (
          <DropdownContent>
            <DropdownMenuHeader
              StartComponent={
                <DropdownMenuHeaderLeftComponent
                  onClick={() => setBrowsedResourceType(null)}
                  Icon={IconChevronLeft}
                />
              }
            >
              {t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[browsedResourceType])}
            </DropdownMenuHeader>
            <DropdownMenuItemsContainer>
              {getUsageLimitOperationTypes(browsedDefinition).map(
                (candidate) => (
                  <MenuItemSelect
                    key={candidate}
                    LeftIcon={USAGE_LIMIT_OPERATION_TYPE_ICONS[candidate]}
                    text={t(USAGE_OPERATION_TYPE_LABELS[candidate])}
                    selected={
                      resourceType === browsedResourceType &&
                      operationType === candidate
                    }
                    onClick={() => handleSelect(candidate)}
                  />
                ),
              )}
            </DropdownMenuItemsContainer>
          </DropdownContent>
        ) : (
          <DropdownContent>
            <DropdownMenuItemsContainer>
              {definitions.definitions.map((definition) => (
                <MenuItemSelect
                  key={definition.resourceType}
                  LeftIcon={
                    USAGE_LIMIT_RESOURCE_TYPE_ICONS[definition.resourceType]
                  }
                  text={t(
                    USAGE_LIMIT_RESOURCE_TYPE_LABELS[definition.resourceType],
                  )}
                  selected={resourceType === definition.resourceType}
                  hasSubMenu
                  onClick={() =>
                    setBrowsedResourceType(definition.resourceType)
                  }
                />
              ))}
            </DropdownMenuItemsContainer>
          </DropdownContent>
        )
      }
    />
  );
};
