import { IconArrowRight } from '@/ui/icon';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Section } from '@/ui/section/components/Section';
import { H2Title } from '@/ui/typography/components/H2Title';

export const IconSection = () => {
  return (
    <Section>
      <H2Title
        title="Icon"
        description="The icon that will be displayed in the sidebar."
      />
      <IconPicker
        selectedIconKey="IconSettings"
        onChange={() => {
          return;
        }}
      />
      <IconArrowRight />
    </Section>
  );
};
