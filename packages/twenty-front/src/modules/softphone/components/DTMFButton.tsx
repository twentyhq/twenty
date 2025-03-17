import { useTheme } from '@emotion/react';
import { useIcons } from 'twenty-ui';

const DTMFButton = () => {
  const { getIcon } = useIcons();

  const IconDialpad = getIcon('IconDialpad');

  const theme = useTheme();

  return (
    <IconDialpad
      onClick={() => console.log('DTMF button clicked')}
      size={theme.icon.size.lg}
      stroke={theme.icon.stroke.sm}
      color={theme.font.color.secondary}
      style={{
        cursor: 'pointer',
        padding: theme.spacing(3),
        borderRadius: '50%',
        // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
        border: `1px solid #fff`,
        backgroundColor: theme.background.tertiary,
      }}
    />
  );
};

export default DTMFButton;
