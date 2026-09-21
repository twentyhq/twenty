import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  IconCoins,
  IconList,
  IconTrash,
  IconUsers,
} from 'twenty-ui/icon';

import { USAGE_LIMIT_RESOURCE_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitResourceTypeIcons';
import { USAGE_LIMIT_RESOURCE_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitResourceTypeLabels';
import { USAGE_LIMIT_SPENDER_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitSpenderTypeIcons';
import { USAGE_LIMIT_SPENDER_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypeLabels';
import { getUsageLimitLabel } from '@/settings/billing/utils/getUsageLimitLabel';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { type UsageResourceType } from '~/generated-metadata/graphql';

const FILTER_DROPDOWN_ID = 'settings-billing-limits-filter';

type FilterContentId = 'usage' | 'spender';

type SettingsBillingLimitsFilterDropdownProps = {
  filterButton: ReactNode;
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

  const [contentId, setContentId] = useState<FilterContentId | null>(null);

  const goToMenu = () => setContentId(null);

  const getSpenderTypeLabel = (spenderType: string): string => {
    const spenderLabel = getUsageLimitLabel(
      USAGE_LIMIT_SPENDER_TYPE_LABELS,
      spenderType,
    );

    return isDefined(spenderLabel) ? t(spenderLabel) : spenderType;
  };

  const hasActiveFilters =
    isDefined(selectedResourceType) || isDefined(selectedSpenderType);

  const renderBackHeader = (title: string) => (
    <DropdownMenuHeader
      StartComponent={
        <DropdownMenuHeaderLeftComponent
          onClick={goToMenu}
          Icon={IconChevronLeft}
        />
      }
    >
      {title}
    </DropdownMenuHeader>
  );

  const renderUsageContent = () => (
    <DropdownContent>
      {renderBackHeader(t`Usage`)}
      <DropdownMenuItemsContainer>
        <DropdownListItem
          onClick={() => onSelectResourceType(null)}
          role="option"
          aria-selected={!isDefined(selectedResourceType)}
          selected={!isDefined(selectedResourceType)}
          indicator="check"
          startIcon={<IconList />}
        >{t`All`}</DropdownListItem>
        {resourceTypes.map((resourceType) => (
          <DropdownListItem
            key={resourceType}
            onClick={() => onSelectResourceType(resourceType)}
            role="option"
            aria-selected={selectedResourceType === resourceType}
            selected={selectedResourceType === resourceType}
            indicator="check"
            startIcon={
              <SelectOptionIcon
                Icon={USAGE_LIMIT_RESOURCE_TYPE_ICONS[resourceType]}
              />
            }
          >
            {t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[resourceType])}
          </DropdownListItem>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );

  const renderSpenderContent = () => (
    <DropdownContent>
      {renderBackHeader(t`Spender`)}
      <DropdownMenuItemsContainer>
        <DropdownListItem
          onClick={() => onSelectSpenderType(null)}
          role="option"
          aria-selected={!isDefined(selectedSpenderType)}
          selected={!isDefined(selectedSpenderType)}
          indicator="check"
          startIcon={<IconList />}
        >{t`All`}</DropdownListItem>
        {spenderTypes.map((spenderType) => (
          <DropdownListItem
            key={spenderType}
            onClick={() => onSelectSpenderType(spenderType)}
            role="option"
            aria-selected={selectedSpenderType === spenderType}
            selected={selectedSpenderType === spenderType}
            indicator="check"
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
          </DropdownListItem>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );

  const renderMenuContent = () => (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        <DropdownListItem
          startIcon={<IconCoins />}
          description={
            isDefined(selectedResourceType)
              ? t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[selectedResourceType])
              : t`All`
          }
          descriptionPlacement="end"
          hasSubmenu
          onClick={() => setContentId('usage')}
        >{t`Usage`}</DropdownListItem>
        <DropdownListItem
          startIcon={<IconUsers />}
          description={
            isDefined(selectedSpenderType)
              ? getSpenderTypeLabel(selectedSpenderType)
              : t`All`
          }
          descriptionPlacement="end"
          hasSubmenu
          onClick={() => setContentId('spender')}
        >{t`Spender`}</DropdownListItem>
        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <DropdownListItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={() => {
                onSelectResourceType(null);
                onSelectSpenderType(null);
              }}
            >{t`Clear filters`}</DropdownListItem>
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );

  const renderContent = () => {
    if (contentId === 'usage') {
      return renderUsageContent();
    }

    if (contentId === 'spender') {
      return renderSpenderContent();
    }

    return renderMenuContent();
  };

  return (
    <Dropdown
      dropdownId={FILTER_DROPDOWN_ID}
      dropdownPlacement="bottom-end"
      dropdownOffset={{ x: 0, y: 8 }}
      onClose={goToMenu}
      clickableComponent={filterButton}
      dropdownComponents={renderContent()}
    />
  );
};
