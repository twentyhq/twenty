import { useState } from 'react';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconArrowRight } from '@/ui/icon';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Section } from '@/ui/section/components/Section';
import { H2Title } from '@/ui/typography/components/H2Title';

export const IconSection = () => {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const [selectedIcon, setSelectedIcon] = useState(() => IconArrowRight);
  const [selectedIconKey, setSelectedIconKey] = useState('IconSettings');

  return (
    <Section>
      <H2Title
        title="Icon"
        description="The icon that will be displayed in the sidebar."
      />
      <IconButton
        Icon={selectedIcon}
        onClick={() => {
          setIconPickerOpen(true);
        }}
      />
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

      <IconArrowRight />
    </Section>
  );
};
