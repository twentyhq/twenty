import { useTheme } from '@emotion/react';
import { useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const DTMFButton = ({
  setIsSendingDTMF,
}: {
  setIsSendingDTMF: (value: boolean) => void;
}) => {
  const { getIcon } = useIcons();

  const theme = useTheme();

  const IconDialpad = getIcon('IconDialpad');

  return (
    <IconButton
      onClick={() => {
        setIsSendingDTMF(true);
      }}
      Icon={() => (
        <IconDialpad
          size={theme.icon.size.lg}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.secondary}
          style={{
            padding: theme.spacing(3),
            borderRadius: '50%',
            // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
            border: `1px solid #fff`,
            backgroundColor: theme.background.tertiary,
          }}
        />
      )}
    />
  );
};

export default DTMFButton;
