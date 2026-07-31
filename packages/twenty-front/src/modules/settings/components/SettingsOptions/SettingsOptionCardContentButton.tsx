import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { isDefined } from 'twenty-shared/utils';

type SettingsOptionCardContentButtonProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  disabled?: boolean;
  Button?: React.ReactNode;
  variant?: 'default' | 'hero';
};

const StyledButtonContainer = styled.div`
  flex-shrink: 0;
  margin-left: auto;
`;

const StyledHeroCardIcon = styled(StyledSettingsCardIcon)`
  height: var(--t-spacing-8);
  min-width: var(--t-spacing-8);
  width: var(--t-spacing-8);
`;

const StyledHeroCardDescription = styled(StyledSettingsCardDescription)`
  text-box-edge: cap alphabetic;
  text-box-trim: trim-both;
`;

const StyledHeroCardTextContainer = styled(StyledSettingsCardTextContainer)`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: var(--t-spacing-2);
  justify-content: center;
`;

const StyledHeroCardTitle = styled(StyledSettingsCardTitle)`
  align-items: center;
  display: flex;
  margin-bottom: 0;
  min-height: var(--t-spacing-4);
  width: 100%;
`;

export const SettingsOptionCardContentButton = ({
  Icon,
  title,
  description,
  disabled = false,
  Button,
  variant = 'default',
}: SettingsOptionCardContentButtonProps) => {
  const isHero = variant === 'hero';
  const IconContainer = isHero ? StyledHeroCardIcon : StyledSettingsCardIcon;
  const Description = isHero
    ? StyledHeroCardDescription
    : StyledSettingsCardDescription;
  const TextContainer = isHero
    ? StyledHeroCardTextContainer
    : StyledSettingsCardTextContainer;
  const Title = isHero ? StyledHeroCardTitle : StyledSettingsCardTitle;

  return (
    <StyledSettingsCardContent disabled={disabled}>
      {Icon && (
        <IconContainer>
          <SettingsOptionIconCustomizer Icon={Icon} />
        </IconContainer>
      )}
      <TextContainer>
        <Title>{title}</Title>
        {description && (
          <Description>
            <OverflowingTextWithTooltip text={description} />
          </Description>
        )}
      </TextContainer>
      {isDefined(Button) && (
        <StyledButtonContainer>{Button}</StyledButtonContainer>
      )}
    </StyledSettingsCardContent>
  );
};
