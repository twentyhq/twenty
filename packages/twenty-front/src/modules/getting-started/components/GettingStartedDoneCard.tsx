import { SettingsCard } from '@/settings/components/SettingsCard';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledMeta = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type GettingStartedDoneCardProps = {
  Icon: IconComponent;
  title: string;
  meta?: ReactNode;
  onClick: () => void;
};

export const GettingStartedDoneCard = ({
  Icon,
  title,
  meta,
  onClick,
}: GettingStartedDoneCardProps) => {
  const theme = useTheme();

  return (
    <SettingsCard
      Icon={<Icon size={theme.icon.size.md} />}
      title={title}
      Status={isDefined(meta) ? <StyledMeta>{meta}</StyledMeta> : undefined}
      onClick={onClick}
    />
  );
};
