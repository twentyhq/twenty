import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingLimitNestedSelect } from '@/settings/billing/components/internal/SettingsBillingLimitNestedSelect';
import { SettingsBillingLimitSpenderOptionList } from '@/settings/billing/components/internal/SettingsBillingLimitSpenderOptionList';
import { AVATAR_SPENDER_TYPES } from '@/settings/billing/constants/AvatarSpenderTypes';
import { USAGE_LIMIT_SPENDER_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitSpenderTypeIcons';
import { USAGE_LIMIT_SPENDER_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypeLabels';
import { USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypePoolLabels';
import { useUsageLimitSpenderOptions } from '@/settings/billing/hooks/useUsageLimitSpenderOptions';
import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';
import { getUsageLimitSpenderGroups } from '@/settings/billing/utils/getUsageLimitSpenderGroups';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceAvatarColorSeed } from '@/workspace/utils/getWorkspaceAvatarColorSeed';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconArrowUp } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { OrganizationAdornment } from '@/settings/enterprise/components/OrganizationAdornment';
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
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const groups = getUsageLimitSpenderGroups(allowedSpenderTypes);

  const { spenderOptionsByType } = useUsageLimitSpenderOptions(
    [spenderType].filter(isDefined),
  );

  const selectedSpenderOptions = isDefined(spenderType)
    ? (spenderOptionsByType[spenderType] ?? [])
    : [];

  const workspaceName = currentWorkspace?.displayName ?? t`Workspace`;
  const workspaceAvatarUrl = getAbsoluteImageUrl(
    currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
  );
  const workspaceAvatarColorSeed = getWorkspaceAvatarColorSeed(workspaceName);

  const handleSelect = (
    nextSpenderType: UsageLimitSpenderType,
    nextSpenderId: string,
  ) => {
    onChange({ spenderType: nextSpenderType, spenderId: nextSpenderId });
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
          colorSeed={workspaceAvatarColorSeed}
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

  const workspaceGroup = groups.find((group) => group.id === 'workspace');
  const otherGroups = groups.filter((group) => group.id !== 'workspace');
  const isLockedByPlan =
    !isIntraWorkspaceLimitEntitled && otherGroups.length > 0;

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
    >
      <Dropdown.Page id="root">
        <Dropdown.Section>
          {isDefined(workspaceGroup) && (
            <Dropdown.OptionItem
              selected={spenderType === 'workspace'}
              onSelect={() => handleSelect('workspace', '')}
              description={t`Workspace`}
              startIcon={
                <Avatar
                  name={workspaceName}
                  colorSeed={workspaceAvatarColorSeed}
                  src={workspaceAvatarUrl}
                  shape="square"
                  size="md"
                />
              }
            >
              {workspaceName}
            </Dropdown.OptionItem>
          )}
          {otherGroups.map((group) =>
            isIntraWorkspaceLimitEntitled ? (
              <Dropdown.ActionItem
                key={group.id}
                page={group.spenderType}
                startIcon={<SelectOptionIcon Icon={group.Icon} />}
              >
                {t(group.label)}
              </Dropdown.ActionItem>
            ) : (
              <ListItem
                key={group.id}
                startIcon={<SelectOptionIcon Icon={group.Icon} />}
                endIcon={<OrganizationAdornment iconOnly />}
              >
                {t(group.label)}
              </ListItem>
            ),
          )}
        </Dropdown.Section>
        {isLockedByPlan && (
          <>
            <Dropdown.Separator />
            <Dropdown.Section>
              <Dropdown.ActionItem
                render={
                  <Link to={getSettingsPath(SettingsPath.BillingPlans)} />
                }
                startIcon={<IconArrowUp />}
              >
                {t`Upgrade to Organization`}
              </Dropdown.ActionItem>
            </Dropdown.Section>
          </>
        )}
      </Dropdown.Page>
      {isIntraWorkspaceLimitEntitled &&
        otherGroups.map((group) => (
          <Dropdown.Page key={group.id} id={group.spenderType}>
            <Dropdown.Back>
              {t(USAGE_LIMIT_SPENDER_TYPE_LABELS[group.spenderType])}
            </Dropdown.Back>
            <SettingsBillingLimitSpenderOptionList
              spenderType={group.spenderType}
              selectedSpenderType={spenderType}
              selectedSpenderId={spenderId}
              onSelect={handleSelect}
            />
          </Dropdown.Page>
        ))}
    </SettingsBillingLimitNestedSelect>
  );
};
