import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconChevronLeft } from 'twenty-ui/icon';
import { MenuItemSelect, MenuItemSelectAvatar } from 'twenty-ui/navigation';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingLimitNestedSelect } from '@/settings/billing/components/internal/SettingsBillingLimitNestedSelect';
import { AVATAR_SPENDER_TYPES } from '@/settings/billing/constants/AvatarSpenderTypes';
import { type UsageLimitSpenderGroup } from '@/settings/billing/constants/UsageLimitSpenderGroups';
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

  const [browsedGroupId, setBrowsedGroupId] = useState<string | null>(null);
  const [browsedSpenderType, setBrowsedSpenderType] =
    useState<UsageLimitSpenderType | null>(null);

  const groups = getUsageLimitSpenderGroups(allowedSpenderTypes);
  const browsedGroup = groups.find((group) => group.id === browsedGroupId);

  const listedSpenderType = browsedSpenderType ?? browsedGroup?.spenderType;
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

  const resetNavigation = () => {
    setBrowsedGroupId(null);
    setBrowsedSpenderType(null);
  };

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
          placeholder={workspaceName}
          avatarUrl={workspaceAvatarUrl}
          type="squared"
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
        placeholder={selectedOption?.label ?? ''}
        avatarUrl={selectedOption?.avatarUrl}
        type={spenderType === 'userWorkspace' ? 'rounded' : 'squared'}
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
        <MenuItemSelectAvatar
          key={option.id}
          text={option.label}
          selected={selected}
          avatar={
            <Avatar
              placeholder={option.label}
              avatarUrl={option.avatarUrl}
              type={kind === 'userWorkspace' ? 'rounded' : 'squared'}
              size="md"
            />
          }
          onClick={() => handleSelect(kind, option.id)}
        />
      );
    }

    return (
      <MenuItemSelect
        key={option.id}
        LeftIcon={USAGE_LIMIT_SPENDER_TYPE_ICONS[kind]}
        text={option.label}
        selected={selected}
        onClick={() => handleSelect(kind, option.id)}
      />
    );
  };

  const renderOptionList = (kind: UsageLimitSpenderType) => (
    <>
      <MenuItemSelect
        text={t(USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS[kind])}
        selected={spenderType === kind && spenderId === ''}
        onClick={() => handleSelect(kind, '')}
      />
      {loading ? (
        <MenuItemSelect text={t`Loading…`} selected={false} disabled />
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

  const renderGroupContent = (group: UsageLimitSpenderGroup) => (
    <DropdownContent>
      {renderBackHeader(t(group.label), () => setBrowsedGroupId(null))}
      <DropdownMenuItemsContainer>
        {isDefined(group.spenderType) && renderOptionList(group.spenderType)}
      </DropdownMenuItemsContainer>
      {isDefined(group.spenderType) && group.subSpenderTypes.length > 0 && (
        <DropdownMenuSeparator />
      )}
      {group.subSpenderTypes.length > 0 && (
        <DropdownMenuItemsContainer>
          {group.subSpenderTypes.map((kind) => (
            <MenuItemSelect
              key={kind}
              LeftIcon={USAGE_LIMIT_SPENDER_TYPE_ICONS[kind]}
              text={t(USAGE_LIMIT_SPENDER_TYPE_LABELS[kind])}
              selected={spenderType === kind}
              hasSubMenu
              onClick={() => setBrowsedSpenderType(kind)}
            />
          ))}
        </DropdownMenuItemsContainer>
      )}
    </DropdownContent>
  );

  const workspaceGroup = groups.find((group) => group.id === 'workspace');
  const otherGroups = groups.filter((group) => group.id !== 'workspace');

  const renderRootContent = () => (
    <DropdownContent>
      {isDefined(workspaceGroup) && (
        <DropdownMenuItemsContainer>
          <MenuItemSelectAvatar
            text={workspaceName}
            selected={spenderType === 'workspace'}
            avatar={
              <Avatar
                placeholder={workspaceName}
                avatarUrl={workspaceAvatarUrl}
                type="squared"
                size="md"
              />
            }
            onClick={() => handleSelect('workspace', '')}
          />
        </DropdownMenuItemsContainer>
      )}
      {isDefined(workspaceGroup) && otherGroups.length > 0 && (
        <DropdownMenuSeparator />
      )}
      {otherGroups.length > 0 && (
        <DropdownMenuItemsContainer>
          {otherGroups.map((group) => (
            <MenuItemSelect
              key={group.id}
              LeftIcon={group.Icon}
              text={t(group.label)}
              selected={
                spenderType === group.spenderType ||
                group.subSpenderTypes.some((kind) => kind === spenderType)
              }
              hasSubMenu
              disabled={!isIntraWorkspaceLimitEntitled}
              contextualText={
                isIntraWorkspaceLimitEntitled ? undefined : t`Organization plan`
              }
              contextualTextPosition="right"
              onClick={() => {
                if (group.subSpenderTypes.length === 0) {
                  setBrowsedSpenderType(group.spenderType);

                  return;
                }

                setBrowsedGroupId(group.id);
              }}
            />
          ))}
        </DropdownMenuItemsContainer>
      )}
    </DropdownContent>
  );

  const renderContent = () => {
    if (isDefined(browsedSpenderType)) {
      return renderSubSpenderContent(browsedSpenderType);
    }

    if (isDefined(browsedGroup)) {
      return renderGroupContent(browsedGroup);
    }

    return renderRootContent();
  };

  return (
    <SettingsBillingLimitNestedSelect
      dropdownId={SPENDER_DROPDOWN_ID}
      label={t`Spender`}
      selectedLabel={getSelectedLabel()}
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
