import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCoins, IconList, IconTrash, IconUsers } from 'twenty-ui/icon';

import { USAGE_LIMIT_RESOURCE_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitResourceTypeIcons';
import { USAGE_LIMIT_RESOURCE_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitResourceTypeLabels';
import { USAGE_LIMIT_SPENDER_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitSpenderTypeIcons';
import { USAGE_LIMIT_SPENDER_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypeLabels';
import { getUsageLimitLabel } from '@/settings/billing/utils/getUsageLimitLabel';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { Dropdown } from 'twenty-ui/components';
import { type UsageResourceType } from '~/generated-metadata/graphql';

const FILTER_DROPDOWN_ID = 'settings-billing-limits-filter';

type SettingsBillingLimitsFilterDropdownProps = {
  filterButton: ReactElement;
  resourceTypes: UsageResourceType[];
  spenderTypes: string[];
  selectedResourceType: UsageResourceType | null;
  selectedSpenderType: string | null;
  onSelectResourceType: (resourceType: UsageResourceType | null) => void;
  onSelectSpenderType: (spenderType: string | null) => void;
};

export const SettingsBillingLimitsFilterDropdown = ({
  filterButton,
  resourceTypes,
  spenderTypes,
  selectedResourceType,
  selectedSpenderType,
  onSelectResourceType,
  onSelectSpenderType,
}: SettingsBillingLimitsFilterDropdownProps) => {
  const { t } = useLingui();

  const getSpenderTypeLabel = (spenderType: string): string => {
    const spenderLabel = getUsageLimitLabel(
      USAGE_LIMIT_SPENDER_TYPE_LABELS,
      spenderType,
    );

    return isDefined(spenderLabel) ? t(spenderLabel) : spenderType;
  };

  const hasActiveFilters =
    isDefined(selectedResourceType) || isDefined(selectedSpenderType);

  const renderUsageContent = () => (
    <>
      <Dropdown.Back>{t`Usage`}</Dropdown.Back>
      <Dropdown.Section>
        <Dropdown.OptionItem
          closeOnSelect={false}
          onSelect={() => onSelectResourceType(null)}
          selected={!isDefined(selectedResourceType)}
          startIcon={<IconList />}
        >{t`All`}</Dropdown.OptionItem>
        {resourceTypes.map((resourceType) => (
          <Dropdown.OptionItem
            key={resourceType}
            closeOnSelect={false}
            onSelect={() => onSelectResourceType(resourceType)}
            selected={selectedResourceType === resourceType}
            startIcon={
              <SelectOptionIcon
                Icon={USAGE_LIMIT_RESOURCE_TYPE_ICONS[resourceType]}
              />
            }
          >
            {t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[resourceType])}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );

  const renderSpenderContent = () => (
    <>
      <Dropdown.Back>{t`Spender`}</Dropdown.Back>
      <Dropdown.Section>
        <Dropdown.OptionItem
          closeOnSelect={false}
          onSelect={() => onSelectSpenderType(null)}
          selected={!isDefined(selectedSpenderType)}
          startIcon={<IconList />}
        >{t`All`}</Dropdown.OptionItem>
        {spenderTypes.map((spenderType) => (
          <Dropdown.OptionItem
            key={spenderType}
            closeOnSelect={false}
            onSelect={() => onSelectSpenderType(spenderType)}
            selected={selectedSpenderType === spenderType}
            startIcon={
              <SelectOptionIcon
                Icon={
                  isKeyOfRecord(USAGE_LIMIT_SPENDER_TYPE_ICONS, spenderType)
                    ? USAGE_LIMIT_SPENDER_TYPE_ICONS[spenderType]
                    : undefined
                }
              />
            }
          >
            {getSpenderTypeLabel(spenderType)}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );

  const renderMenuContent = () => (
    <>
      <Dropdown.Section>
        <Dropdown.ActionItem
          startIcon={<IconCoins />}
          description={
            isDefined(selectedResourceType)
              ? t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[selectedResourceType])
              : t`All`
          }
          descriptionPlacement="end"
          hasSubmenu
          page="usage"
        >{t`Usage`}</Dropdown.ActionItem>
        <Dropdown.ActionItem
          startIcon={<IconUsers />}
          description={
            isDefined(selectedSpenderType)
              ? getSpenderTypeLabel(selectedSpenderType)
              : t`All`
          }
          descriptionPlacement="end"
          hasSubmenu
          page="spender"
        >{t`Spender`}</Dropdown.ActionItem>
        {hasActiveFilters && (
          <>
            <Dropdown.Separator />
            <Dropdown.ActionItem
              closeOnClick={false}
              color="danger"
              startIcon={<IconTrash />}
              onClick={() => {
                onSelectResourceType(null);
                onSelectSpenderType(null);
              }}
            >{t`Clear filters`}</Dropdown.ActionItem>
          </>
        )}
      </Dropdown.Section>
    </>
  );

  return (
    <DropdownRoot dropdownId={FILTER_DROPDOWN_ID} type="picker">
      <Dropdown.Trigger render={filterButton} />
      <DropdownContent align="end" sideOffset={8}>
        <Dropdown.Page id="root">{renderMenuContent()}</Dropdown.Page>
        <Dropdown.Page id="usage">{renderUsageContent()}</Dropdown.Page>
        <Dropdown.Page id="spender">{renderSpenderContent()}</Dropdown.Page>
      </DropdownContent>
    </DropdownRoot>
  );
};
