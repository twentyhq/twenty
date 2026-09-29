import { AVATAR_SPENDER_TYPES } from '@/settings/billing/constants/AvatarSpenderTypes';
import { USAGE_LIMIT_SPENDER_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitSpenderTypeIcons';
import { USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypePoolLabels';
import { useUsageLimitSpenderOptions } from '@/settings/billing/hooks/useUsageLimitSpenderOptions';
import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';
import { Avatar } from 'twenty-ui/primitives/data-display';

type SettingsBillingLimitSpenderOptionListProps = {
  spenderType: UsageLimitSpenderType;
  selectedSpenderType: UsageLimitSpenderType | null;
  selectedSpenderId: string;
  onSelect: (spenderType: UsageLimitSpenderType, spenderId: string) => void;
};

export const SettingsBillingLimitSpenderOptionList = ({
  spenderType,
  selectedSpenderType,
  selectedSpenderId,
  onSelect,
}: SettingsBillingLimitSpenderOptionListProps) => {
  const { t } = useLingui();
  const { spenderOptionsByType, loading } = useUsageLimitSpenderOptions([
    spenderType,
  ]);

  const spenderOptions = spenderOptionsByType[spenderType] ?? [];
  const isSelectedSpenderType = selectedSpenderType === spenderType;

  return (
    <Dropdown.Section>
      <Dropdown.OptionItem
        selected={isSelectedSpenderType && selectedSpenderId === ''}
        onSelect={() => onSelect(spenderType, '')}
      >
        {t(USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS[spenderType])}
      </Dropdown.OptionItem>
      {loading ? (
        <Dropdown.Loading>{t`Loading…`}</Dropdown.Loading>
      ) : (
        spenderOptions.map((option) => (
          <Dropdown.OptionItem
            key={option.id}
            selected={isSelectedSpenderType && selectedSpenderId === option.id}
            onSelect={() => onSelect(spenderType, option.id)}
            startIcon={
              AVATAR_SPENDER_TYPES.includes(spenderType) ? (
                <Avatar
                  name={option.label}
                  src={option.avatarUrl}
                  shape={spenderType === 'userWorkspace' ? 'circle' : 'square'}
                  size="md"
                />
              ) : (
                <SelectOptionIcon
                  Icon={USAGE_LIMIT_SPENDER_TYPE_ICONS[spenderType]}
                />
              )
            }
          >
            {option.label}
          </Dropdown.OptionItem>
        ))
      )}
    </Dropdown.Section>
  );
};
