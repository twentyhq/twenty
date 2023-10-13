import styled from '@emotion/styled';

import { SettingsIconSection } from '@/settings/components/SettingsIconSection';
import { Breadcrumb } from '@/ui/breadcrumb/components/Breadcrumb';
import { IconSettings } from '@/ui/icon';
import { useIconPicker } from '@/ui/input/hooks/useIconPicker';
import { SubMenuTopBarContainer } from '@/ui/layout/components/SubMenuTopBarContainer';

import { objectSettingsWidth } from './constants/objectSettings';

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  width: ${objectSettingsWidth};
`;

export const SettingsNewObject = () => {
  const { Icon, iconKey, setIconPicker } = useIconPicker();

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <StyledContainer>
        <Breadcrumb
          links={[
            { children: 'Objects', href: '/settings/objects' },
            { children: 'New' },
          ]}
        />

        <SettingsIconSection
          Icon={Icon}
          iconKey={iconKey}
          setIconPicker={setIconPicker}
        />
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
