import { StackIcon } from 'twenty-ui/components/data-display';
import { IconStack2, type IconComponent } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';

type ScopedRelationColumnIconProps = {
  Icon: IconComponent;
};

export const ScopedRelationColumnIcon = ({
  Icon,
}: ScopedRelationColumnIconProps) => {
  const theme = useTheme();

  return (
    <StackIcon
      icon={<Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />}
      stackedIcon={
        <Avatar
          size="xs"
          variant="outline"
          color={theme.font.color.secondary}
          backgroundColor={theme.background.primary}
          borderColor={theme.border.color.medium}
          fallbackProps={{ children: <IconStack2 /> }}
        />
      }
    />
  );
};
