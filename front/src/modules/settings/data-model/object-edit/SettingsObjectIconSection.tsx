import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Section } from '@/ui/layout/section/components/Section';

import ArrowRight from '../assets/ArrowRight.svg';

import { SettingsObjectIconWithLabel } from './SettingsObjectIconWithLabel';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledArrowContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
`;

type SettingsObjectIconSectionProps = {
  Icon: IconComponent;
  iconKey: string;
  setIconPicker?: (icon: { Icon: IconComponent; iconKey: string }) => void;
};

export const SettingsObjectIconSection = ({
  Icon,
  iconKey,
  setIconPicker,
}: SettingsObjectIconSectionProps) => {
  return (
    <Section>
      <H2Title
        title="Icon"
        description="The icon that will be displayed in the sidebar."
      />
      <StyledContainer>
        <IconPicker
          selectedIconKey={iconKey}
          onChange={(icon) => {
            setIconPicker?.({ Icon: icon.Icon, iconKey: icon.iconKey });
          }}
        />
        <StyledArrowContainer>
          <img src={ArrowRight} alt="Arrow right" width={32} height={16} />
        </StyledArrowContainer>
        <SettingsObjectIconWithLabel Icon={Icon} label="Workspaces" />
      </StyledContainer>
    </Section>
  );
};
