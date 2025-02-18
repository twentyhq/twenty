import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { Key } from 'ts-key-enum';
import { Button, getOsControlSymbol } from 'twenty-ui';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const CmdEnterActionButton = ({
  title,
  onClick,
  disabled = false,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );
  useScopedHotkeys(
    [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    () => onClick(),
    isCommandMenuV2Enabled
      ? AppHotkeyScope.CommandMenuOpen
      : RightDrawerHotkeyScope.RightDrawer,
    [onClick],
  );

  return (
    <Button
      title={title}
      variant="primary"
      accent="blue"
      size="medium"
      onClick={onClick}
      disabled={disabled}
      hotkeys={[getOsControlSymbol(), '⏎']}
    />
  );
};
