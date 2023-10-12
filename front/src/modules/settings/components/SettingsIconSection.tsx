import { useState } from 'react';
import styled from '@emotion/styled';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconArrowRight } from '@/ui/icon';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Section } from '@/ui/section/components/Section';
import { H2Title } from '@/ui/typography/components/H2Title';

import { IconWithDescription } from './IconWithDescription';

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  gap: 16px;
`;

export const SettingsIconSection = () => {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const [SelectedIcon, setSelectedIcon] = useState<any>(() => IconArrowRight);
  const [selectedIconKey, setSelectedIconKey] = useState('IconSettings');

  return (
    <Section>
      <H2Title
        title="Icon"
        description="The icon that will be displayed in the sidebar."
      />
      <StyledContainer>
        <IconButton
          Icon={SelectedIcon}
          onClick={() => {
            setIconPickerOpen(true);
          }}
        />
        <IconArrowRight />
        <IconWithDescription Icon={SelectedIcon} description="Workspaces" />
      </StyledContainer>
      {iconPickerOpen && (
        <IconPicker
          selectedIconKey={selectedIconKey}
          onChange={(icon) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setSelectedIcon(icon.Icon);
            setSelectedIconKey(icon.iconKey);
            setIconPickerOpen(false);
          }}
        />
      )}
    </Section>
  );
};
