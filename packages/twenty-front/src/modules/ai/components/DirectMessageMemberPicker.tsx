import { type DirectMessageMember } from '@/ai/types/DirectMessageMember';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';

type DirectMessageMemberPickerProps = {
  humanMembers: readonly DirectMessageMember[];
  currentWorkspaceMemberId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  searchValue: string;
  onSearchChange: (searchValue: string) => void;
  isLoading: boolean;
  onSelect: (workspaceMemberId: string) => void;
};

export const DirectMessageMemberPicker = ({
  humanMembers,
  currentWorkspaceMemberId,
  isOpen,
  onOpenChange,
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

  return (
    <Dropdown.Root type="picker" open={isOpen} onOpenChange={onOpenChange}>
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`Add DM`}>
            <IconPlus />
          </LightIconButton>
        }
      />
      <Dropdown.Content aria-label={t`Add DM`} width={320} align="start">
        <Dropdown.Search
          aria-label={t`Search members`}
          placeholder={t`Search members`}
          value={searchValue}
          onValueChange={onSearchChange}
        />
        <Dropdown.Section>
          {isLoading && (
            <Dropdown.Loading>{t`Loading members`}</Dropdown.Loading>
          )}
          {!isLoading && hasMembers && (
            <Dropdown.SelectionGroup
              aria-label={t`Members`}
              value={null}
              onValueChange={(workspaceMemberId) => {
                if (isDefined(workspaceMemberId)) {
                  onSelect(workspaceMemberId);
                }
              }}
            >
              {otherHumanMembers.map((member) => (
                <Dropdown.OptionItem
                  key={member.workspaceMemberId}
                  value={member.workspaceMemberId}
                  indicator="none"
                  startIcon={
                    <Avatar
                      name={member.name}
                      src={member.avatarUrl}
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
          {!isLoading && !hasMembers && (
            <Dropdown.Empty>{t`No members found`}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
