import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { Separator } from '@/settings/components/Separator';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsOptionCardContentSelectProps = {
  Icon?: IconComponent;
  LeftComponent?: React.ReactNode;
  title: React.ReactNode;
  description?: string;
  divider?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
};

const StyledSelectContainer = styled.div`
  flex-shrink: 0;
  justify-content: flex-end;
  margin-left: auto;
  max-width: var(--settings-select-control-width, 120px);
  width: var(--settings-select-control-width, auto);

  @container settings-select-group (max-width: 520px) {
    max-width: 100%;
  }
`;

const StyledSelectRow = styled(StyledSettingsCardContent)`
  @container settings-select-group (max-width: 520px) {
    flex-wrap: wrap;
  }
`;

const StyledSelectText = styled(StyledSettingsCardTextContainer)`
  @container settings-select-group (max-width: 520px) {
    flex-basis: calc(
      100% - ${themeCssVariables.spacing[8]} - ${themeCssVariables.spacing[3]}
    );
  }
`;

export const SettingsOptionCardContentSelect = ({
  Icon,
  LeftComponent,
  title,
  description,
  divider,
  disabled = false,
  children,
}: SettingsOptionCardContentSelectProps) => {
  return (
    <>
      <StyledSelectRow disabled={disabled}>
        {(isDefined(LeftComponent) || isDefined(Icon)) && (
          <StyledSettingsCardIcon>
            {LeftComponent ??
              (Icon && <SettingsOptionIconCustomizer Icon={Icon} />)}
          </StyledSettingsCardIcon>
        )}
        <StyledSelectText>
          <StyledSettingsCardTitle>{title}</StyledSettingsCardTitle>
          {description && (
            <StyledSettingsCardDescription>
              <OverflowingTextWithTooltip text={description} />
            </StyledSettingsCardDescription>
          )}
        </StyledSelectText>
        <StyledSelectContainer>{children}</StyledSelectContainer>
      </StyledSelectRow>
      {divider && <Separator />}
    </>
  );
};
