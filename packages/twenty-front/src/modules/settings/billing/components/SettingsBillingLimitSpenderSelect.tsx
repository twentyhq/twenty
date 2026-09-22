import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { IconChevronLeft } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingLimitNestedSelect } from '@/settings/billing/components/internal/SettingsBillingLimitNestedSelect';
import { AVATAR_SPENDER_TYPES } from '@/settings/billing/constants/AvatarSpenderTypes';
import { USAGE_LIMIT_SPENDER_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitSpenderTypeIcons';
import { USAGE_LIMIT_SPENDER_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypeLabels';
import { USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypePoolLabels';
import {
  type UsageLimitSpenderOption,
  useUsageLimitSpenderOptions,
} from '@/settings/billing/hooks/useUsageLimitSpenderOptions';
import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';
import { getUsageLimitSpenderGroups } from '@/settings/billing/utils/getUsageLimitSpenderGroups';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const SPENDER_DROPDOWN_ID = 'usage-limit-spender';

type SettingsBillingLimitSpenderSelectProps = {
  allowedSpenderTypes: string[];
  isIntraWorkspaceLimitEntitled: boolean;
  spenderType: UsageLimitSpenderType | null;
  spenderId: string;
  isDisabled?: boolean;
  onChange: (spender: {
    spenderType: UsageLimitSpenderType;
    spenderId: string;
  }) => void;
};

export const SettingsBillingLimitSpenderSelect = ({
  allowedSpenderTypes,
  isIntraWorkspaceLimitEntitled,
  spenderType,
  spenderId,
  isDisabled = false,
  onChange,
}: SettingsBillingLimitSpenderSelectProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const [browsedSpenderType, setBrowsedSpenderType] =
    useState<UsageLimitSpenderType | null>(null);

  const groups = getUsageLimitSpenderGroups(allowedSpenderTypes);

  const listedSpenderType = browsedSpenderType ?? undefined;
  const { spenderOptionsByType, loading } = useUsageLimitSpenderOptions(
    [listedSpenderType, spenderType].filter(isDefined),
  );

  const listedSpenderOptions = isDefined(listedSpenderType)
    ? (spenderOptionsByType[listedSpenderType] ?? [])
    : [];
  const selectedSpenderOptions = isDefined(spenderType)
    ? (spenderOptionsByType[spenderType] ?? [])
    : [];

  const workspaceName = currentWorkspace?.displayName ?? t`Workspace`;
  const workspaceAvatarUrl = getAbsoluteImageUrl(
    currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
  );

  const resetNavigation = () => setBrowsedSpenderType(null);

  const handleSelect = (
    nextSpenderType: UsageLimitSpenderType,
    nextSpenderId: string,
  ) => {
    onChange({ spenderType: nextSpenderType, spenderId: nextSpenderId });
    resetNavigation();
    closeDropdown(SPENDER_DROPDOWN_ID);
  };

  const getSelectedLabel = (): string => {
    if (!isDefined(spenderType)) {
      return t`Choose a spender`;
    }

    if (spenderType === 'workspace') {
      return workspaceName;
    }

    if (spenderId === '') {
      return t(USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS[spenderType]);
    }

    return (
      selectedSpenderOptions.find((option) => option.id === spenderId)?.label ??
      t(USAGE_LIMIT_SPENDER_TYPE_LABELS[spenderType])
    );
  };

  const renderSelectedAvatar = () => {
    if (spenderType === 'workspace') {
      return (
        <Avatar
          name={workspaceName}
          src={workspaceAvatarUrl}
          shape="square"
          size="md"
        />
      );
    }

    if (
      !isDefined(spenderType) ||
      spenderId === '' ||
      !AVATAR_SPENDER_TYPES.includes(spenderType)
    ) {
      return undefined;
    }

    const selectedOption = selectedSpenderOptions.find(
      (option) => option.id === spenderId,
    );

    return (
      <Avatar
        name={selectedOption?.label ?? ''}
        src={selectedOption?.avatarUrl}
        shape={spenderType === 'userWorkspace' ? 'circle' : 'square'}
        size="md"
      />
    );
  };

  const renderOption = (
    kind: UsageLimitSpenderType,
    option: UsageLimitSpenderOption,
  ) => {
    const selected = spenderType === kind && spenderId === option.id;

    if (AVATAR_SPENDER_TYPES.includes(kind)) {
      return (
        <ListItem
          key={option.id}
          onClick={() => handleSelect(kind, option.id)}
          role="option"
          aria-selected={selected}
          selected={selected}
          indicator="check"
          startIcon={
            <Avatar
              name={option.label}
              src={option.avatarUrl}
              shape={kind === 'userWorkspace' ? 'circle' : 'square'}
              size="md"
            />
          }
        >
          {option.label}
        </ListItem>
      );
    }

    return (
      <ListItem
        key={option.id}
        onClick={() => handleSelect(kind, option.id)}
        role="option"
        aria-selected={selected}
        selected={selected}
        indicator="check"
        startIcon={
          <SelectOptionIcon Icon={USAGE_LIMIT_SPENDER_TYPE_ICONS[kind]} />
        }
      >
        {option.label}
      </ListItem>
    );
  };

  const renderOptionList = (kind: UsageLimitSpenderType) => (
    <>
      <ListItem
        onClick={() => handleSelect(kind, '')}
        role="option"
        aria-selected={spenderType === kind && spenderId === ''}
        selected={spenderType === kind && spenderId === ''}
        indicator="check"
      >
        {t(USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS[kind])}
      </ListItem>
      {loading ? (
        <ListItem
          disabled
          role="option"
          aria-selected={false}
          selected={false}
          indicator="check"
        >{t`Loading…`}</ListItem>
      ) : (
        listedSpenderOptions.map((option) => renderOption(kind, option))
      )}
    </>
  );

  const renderBackHeader = (title: string, onBack: () => void) => (
    <DropdownMenuHeader
      StartComponent={
        <DropdownMenuHeaderLeftComponent
          onClick={onBack}
          Icon={IconChevronLeft}
        />
      }
    >
      {title}
    </DropdownMenuHeader>
  );

  const renderSubSpenderContent = (kind: UsageLimitSpenderType) => (
    <DropdownContent>
      {renderBackHeader(t(USAGE_LIMIT_SPENDER_TYPE_LABELS[kind]), () =>
        setBrowsedSpenderType(null),
      )}
      <DropdownMenuItemsContainer>
        {renderOptionList(kind)}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );

  const workspaceGroup = groups.find((group) => group.id === 'workspace');
  const otherGroups = groups.filter((group) => group.id !== 'workspace');

  const renderRootContent = () => (
    <DropdownContent>
      {isDefined(workspaceGroup) && (
        <DropdownMenuItemsContainer>
          <ListItem
            onClick={() => handleSelect('workspace', '')}
            role="option"
            aria-selected={spenderType === 'workspace'}
            selected={spenderType === 'workspace'}
            indicator="check"
            description={t`Workspace`}
            startIcon={
              <Avatar
                name={workspaceName}
                src={workspaceAvatarUrl}
                shape="square"
                size="md"
              />
            }
          >
            {workspaceName}
          </ListItem>
        </DropdownMenuItemsContainer>
      )}
      {isDefined(workspaceGroup) && otherGroups.length > 0 && (
        <DropdownMenuSeparator />
      )}
      {otherGroups.length > 0 && (
        <DropdownMenuItemsContainer>
          {otherGroups.map((group) =>
            isIntraWorkspaceLimitEntitled ? (
              <ListItem
                key={group.id}
                onClick={() => setBrowsedSpenderType(group.spenderType)}
                role="option"
                aria-selected={false}
                selected={false}
                indicator="check"
                hasSubmenu={true}
                startIcon={<SelectOptionIcon Icon={group.Icon} />}
              >
                {t(group.label)}
              </ListItem>
            ) : (
              <ListItem
                key={group.id}
                disabled
                role="option"
                aria-selected={false}
                selected={false}
                indicator="check"
                description={t`Organization plan`}
                descriptionPlacement={'end'}
                startIcon={<SelectOptionIcon Icon={group.Icon} />}
              >
                {t(group.label)}
              </ListItem>
            ),
          )}
        </DropdownMenuItemsContainer>
      )}
    </DropdownContent>
  );

  const renderContent = () => {
    if (isDefined(browsedSpenderType)) {
      return renderSubSpenderContent(browsedSpenderType);
    }

    return renderRootContent();
  };

  return (
    <SettingsBillingLimitNestedSelect
      dropdownId={SPENDER_DROPDOWN_ID}
      label={t`Spender`}
      selectedLabel={getSelectedLabel()}
      selectedContextualText={
        spenderType === 'workspace' ? t`Workspace` : undefined
      }
      SelectedIcon={
        isDefined(spenderType)
          ? USAGE_LIMIT_SPENDER_TYPE_ICONS[spenderType]
          : undefined
      }
      SelectedAvatar={renderSelectedAvatar()}
      isDisabled={isDisabled}
      onClose={resetNavigation}
      dropdownComponents={renderContent()}
    />
  );
};
