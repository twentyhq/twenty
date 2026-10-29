import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilter } from 'twenty-ui/icon';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AiChatInboxFilterOption } from '@/ai/types/AiChatInboxFilterOption';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

const StyledLabel = styled.span<{ $isUnread: boolean }>`
  color: ${({ $isUnread }) =>
    $isUnread ? themeCssVariables.font.color.primary : 'inherit'};
  font-weight: ${({ $isUnread }) =>
    $isUnread
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.regular};
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

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
        <Dropdown.Section label={t`View`}>
          {options.map(
            ({
              key,
              label,
              Icon,
              count,
              isUnread = false,
              isSelected,
              onSelect,
            }) => (
              <Dropdown.OptionItem
                key={key}
                startIcon={<Icon />}
                endIcon={
                  isDefined(count) && count > 0 ? (
                    <StyledCount>{formatNumber(count)}</StyledCount>
                  ) : undefined
                }
                selected={isSelected}
                onSelect={onSelect}
              >
                <StyledLabel $isUnread={isUnread}>
                  {label}
                  {isUnread && <VisuallyHidden>{t`, unread`}</VisuallyHidden>}
                </StyledLabel>
              </Dropdown.OptionItem>
            ),
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
