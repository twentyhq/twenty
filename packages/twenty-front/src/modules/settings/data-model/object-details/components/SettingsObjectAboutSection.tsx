import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconArchive, IconDotsVertical, IconPencil } from '@/ui/display/icon';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { Tag } from '@/ui/display/tag/components/Tag';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
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

const dropdownId = 'settings-object-edit-about-menu-dropdown';

export const SettingsAboutSection = ({
  iconKey = '',
  isCustom,
  name,
  onDisable,
  onEdit,
}: SettingsAboutSectionProps) => {
  const { translate } = useI18n('translations');
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(iconKey);

  const { closeDropdown } = useDropdown(dropdownId);

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
      <H2Title
        title={translate('about')}
        description={translate('manageYourObject')}
      />
      <Card>
        <StyledCardContent>
          <StyledName>
            {!!Icon && <Icon size={theme.icon.size.md} />}
            {name}
          </StyledName>
          {isCustom ? (
            <StyledTag
              color="orange"
              text={translate('custom')}
              weight="medium"
            />
          ) : (
            <StyledTag
              color="blue"
              text={translate('standard')}
              weight="medium"
            />
          )}
          <Dropdown
            dropdownId={dropdownId}
            clickableComponent={
              <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
            }
            dropdownComponents={
              <DropdownMenu width="160px">
                <DropdownMenuItemsContainer>
                  <MenuItem
                    text={translate('edit')}
                    LeftIcon={IconPencil}
                    onClick={handleEdit}
                  />
                  <MenuItem
                    text={translate('disable')}
                    LeftIcon={IconArchive}
                    onClick={handleDisable}
                  />
                </DropdownMenuItemsContainer>
              </DropdownMenu>
            }
            dropdownHotkeyScope={{
              scope: dropdownId,
            }}
          />
        </StyledCardContent>
      </Card>
    </Section>
  );
};
