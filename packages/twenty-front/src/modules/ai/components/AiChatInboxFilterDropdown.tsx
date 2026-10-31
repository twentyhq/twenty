import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilter } from 'twenty-ui/icon';

import { type AiChatInboxFilterOption } from '@/ai/types/AiChatInboxFilterOption';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type AiChatInboxFilterDropdownProps = {
  options: AiChatInboxFilterOption[];
  isFiltered: boolean;
};

export const AiChatInboxFilterDropdown = ({
  options,
  isFiltered,
}: AiChatInboxFilterDropdownProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const { formatNumber } = useNumberFormat();

  return (
    <DropdownRoot dropdownId={`ai-chat-inbox-filter-${instanceId}`} type="menu">
      <Dropdown.Trigger
        render={
          <IconButton
            size="sm"
            variant="outline"
            color={isFiltered ? 'accent' : 'neutral'}
            aria-label={t`Filter chats`}
          >
            <IconFilter />
          </IconButton>
        }
      />
      <DropdownContent align="end" aria-label={t`Filter chats`}>
        <Dropdown.Section>
          {options.map(({ key, label, Icon, count, isSelected, onSelect }) => (
            <Dropdown.OptionItem
              key={key}
              startIcon={<Icon />}
              description={
                isDefined(count) && count > 0 ? formatNumber(count) : undefined
              }
              selected={isSelected}
              onSelect={onSelect}
            >
              {label}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
