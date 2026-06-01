import { useCallback } from 'react';

import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { t } from '@lingui/core/macro';
import { IconSend } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';

type ComposeEmailFooterProps = {
  sendLabel: string;
  canSend: boolean;
  onSend: () => void;
  onCancel: () => void;
};

export const ComposeEmailFooter = ({
  sendLabel,
  canSend,
  onSend,
  onCancel,
}: ComposeEmailFooterProps) => {
  const handleSendHotkey = useCallback(() => {
    if (canSend) {
      onSend();
    }
  }, [canSend, onSend]);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleSendHotkey,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleSendHotkey],
  });

  return (
    <SidePanelFooter
      actions={[
        <Button
          key="cancel"
          size="small"
          variant="secondary"
          title={t`Cancel`}
          onClick={onCancel}
        />,
        <Button
          key="send"
          size="small"
          variant="primary"
          accent="blue"
          title={sendLabel}
          Icon={IconSend}
          hotkeys={[getOsControlSymbol(), '⏎']}
          onClick={onSend}
          disabled={!canSend}
        />,
      ]}
    />
  );
};
