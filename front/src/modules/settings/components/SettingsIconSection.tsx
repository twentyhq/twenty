import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { H2Title } from '@/ui/typography/components/H2Title';

import ArrowRight from '../assets/ArrowRight.svg';

import { IconWithLabel } from './IconWithLabel';

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

type SettingsIconSectionProps = {
  Icon: IconComponent;
  iconKey: string;
  setIconPicker: (icon: { Icon: IconComponent; iconKey: string }) => void;
};

export const SettingsIconSection = ({
  Icon,
  iconKey,
  setIconPicker,
}: SettingsIconSectionProps) => {
  return (
    <section>
      <H2Title
        title="Icon"
        description="The icon that will be displayed in the sidebar."
      />
      <StyledContainer>
        <IconPicker
          selectedIconKey={iconKey}
          onChange={(icon) => {
            setIconPicker({ Icon: icon.Icon, iconKey: icon.iconKey });
          }}
        />
        <StyledArrowContainer>
          <img src={ArrowRight} alt="Arrow right" width={32} height={16} />
        </StyledArrowContainer>
        <IconWithLabel Icon={Icon} label="Workspaces" />
      </StyledContainer>
    </section>
  );
};
