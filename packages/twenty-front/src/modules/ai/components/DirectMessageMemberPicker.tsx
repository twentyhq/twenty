import { type DirectMessageMember } from '@/ai/types/DirectMessageMember';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';

const DIRECT_MESSAGE_MEMBER_PICKER_DROPDOWN_ID = 'direct-message-member-picker';

type DirectMessageMemberPickerProps = {
  humanMembers: readonly DirectMessageMember[];
  currentWorkspaceMemberId: string;
  searchValue: string;
  onSearchChange: (searchValue: string) => void;
  isLoading: boolean;
  onSelect: (workspaceMemberId: string) => void;
};

export const DirectMessageMemberPicker = ({
  humanMembers,
  currentWorkspaceMemberId,
  searchValue,
  onSearchChange,
  isLoading,
  onSelect,
}: DirectMessageMemberPickerProps) => {
  const { t } = useLingui();
  const otherHumanMembers = humanMembers.filter(
    ({ workspaceMemberId }) => workspaceMemberId !== currentWorkspaceMemberId,
  );
  const hasMembers = isNonEmptyArray(otherHumanMembers);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      onSearchChange('');
    }
  };

  return (
    <DropdownRoot
      type="picker"
      dropdownId={DIRECT_MESSAGE_MEMBER_PICKER_DROPDOWN_ID}
      onOpenChange={handleOpenChange}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            emphasis="subtle"
            aria-label={t({
              message: 'Add DM',
              comment: 'Abbreviation of add direct message, sidebar button',
            })}
          >
            <IconPlus />
          </LightIconButton>
        }
      />
      <DropdownContent width={GenericDropdownContentWidth.ExtraLarge}>
        <Dropdown.Search
          aria-label={t`Search members`}
          placeholder={t`Search members`}
          value={searchValue}
          onValueChange={onSearchChange}
        />
        <Dropdown.Separator />
        <Dropdown.Section scrollable>
          {hasMembers && (
            <Dropdown.SelectionGroup aria-label={t`Members`} value={null}>
              {otherHumanMembers.map((member) => (
                <Dropdown.OptionItem
                  key={member.workspaceMemberId}
                  value={member.workspaceMemberId}
                  disabled={isLoading}
                  onSelect={() => onSelect(member.workspaceMemberId)}
                  startIcon={
                    <Avatar
                      name={member.name}
                      src={member.avatarUrl}
                      colorSeed={member.workspaceMemberId}
                      shape="circle"
                      size="md"
                    />
                  }
                  description={member.email}
                >
                  {member.name}
                </Dropdown.OptionItem>
              ))}
            </Dropdown.SelectionGroup>
          )}
          {!hasMembers && isLoading && (
            <Dropdown.Loading>{t`Loading members`}</Dropdown.Loading>
          )}
          {!hasMembers && !isLoading && (
            <Dropdown.Empty>{t`No members found`}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
