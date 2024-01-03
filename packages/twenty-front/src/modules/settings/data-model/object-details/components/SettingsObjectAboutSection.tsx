import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconArchive, IconDotsVertical, IconPencil } from '@/ui/display/icon';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { Tag } from '@/ui/display/tag/components/Tag';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { Section } from '@/ui/layout/section/components/Section';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type SettingsAboutSectionProps = {
  iconKey?: string;
  isCustom: boolean;
  name: string;
  onDisable: () => void;
  onEdit: () => void;
};

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-right: auto;
`;

const StyledTag = styled(Tag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(6)};
`;

const dropdownScopeId = 'settings-object-edit-about-menu-dropdown';

export const SettingsAboutSection = ({
  iconKey = '',
  isCustom,
  name,
  onDisable,
  onEdit,
}: SettingsAboutSectionProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(iconKey);

  const { closeDropdown } = useDropdown(dropdownScopeId);

  const handleEdit = () => {
    onEdit();
    closeDropdown();
  };

  const handleDisable = () => {
    onDisable();
    closeDropdown();
  };

  return (
    <Section>
      <H2Title title="About" description="Manage your object" />
      <Card>
        <StyledCardContent>
          <StyledName>
            {!!Icon && <Icon size={theme.icon.size.md} />}
            {name}
          </StyledName>
          {isCustom ? (
            <StyledTag color="orange" text="Custom" weight="medium" />
          ) : (
            <StyledTag color="blue" text="Standard" weight="medium" />
          )}
          <DropdownScope dropdownScopeId={dropdownScopeId}>
            <Dropdown
              clickableComponent={
                <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
              }
              dropdownComponents={
                <DropdownMenu width="160px">
                  <DropdownMenuItemsContainer>
                    <MenuItem
                      text="Edit"
                      LeftIcon={IconPencil}
                      onClick={handleEdit}
                    />
                    <MenuItem
                      text="Disable"
                      LeftIcon={IconArchive}
                      onClick={handleDisable}
                    />
                  </DropdownMenuItemsContainer>
                </DropdownMenu>
              }
              dropdownHotkeyScope={{
                scope: dropdownScopeId,
              }}
            />
          </DropdownScope>
        </StyledCardContent>
      </Card>
    </Section>
  );
};
