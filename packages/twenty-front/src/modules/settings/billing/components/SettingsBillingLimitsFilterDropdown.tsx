import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
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
import { MenuItem, ListItem } from 'twenty-ui/primitives/navigation';

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
        <ListItem
          onClick={() => onSelectResourceType(null)}
          role="option"
          aria-selected={!isDefined(selectedResourceType)}
          selected={!isDefined(selectedResourceType)}
          indicator="check"
          startIcon={<SelectOptionIcon Icon={IconList} />}
        >
          <OverflowingTextWithTooltip text={t`All`} />
        </ListItem>
        {resourceTypes.map((resourceType) => (
          <ListItem
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
            <OverflowingTextWithTooltip
              text={t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[resourceType])}
            />
          </ListItem>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );

  const renderSpenderContent = () => (
    <DropdownContent>
      {renderBackHeader(t`Spender`)}
      <DropdownMenuItemsContainer>
        <ListItem
          onClick={() => onSelectSpenderType(null)}
          role="option"
          aria-selected={!isDefined(selectedSpenderType)}
          selected={!isDefined(selectedSpenderType)}
          indicator="check"
          startIcon={<SelectOptionIcon Icon={IconList} />}
        >
          <OverflowingTextWithTooltip text={t`All`} />
        </ListItem>
        {spenderTypes.map((spenderType) => (
          <ListItem
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
            <OverflowingTextWithTooltip
              text={getSpenderTypeLabel(spenderType)}
            />
          </ListItem>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );

  const renderMenuContent = () => (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        <MenuItem
          LeftIcon={IconCoins}
          text={t`Usage`}
          contextualText={
            isDefined(selectedResourceType)
              ? t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[selectedResourceType])
              : t`All`
          }
          contextualTextPosition="right"
          hasSubMenu
          onClick={() => setContentId('usage')}
        />
        <MenuItem
          LeftIcon={IconUsers}
          text={t`Spender`}
          contextualText={
            isDefined(selectedSpenderType)
              ? getSpenderTypeLabel(selectedSpenderType)
              : t`All`
          }
          contextualTextPosition="right"
          hasSubMenu
          onClick={() => setContentId('spender')}
        />
        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Clear filters`}
              onClick={() => {
                onSelectResourceType(null);
                onSelectSpenderType(null);
              }}
            />
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
