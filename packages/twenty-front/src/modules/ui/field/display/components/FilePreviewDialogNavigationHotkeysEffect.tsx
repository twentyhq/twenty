import { Key } from 'ts-key-enum';

import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

type FilePreviewDialogNavigationHotkeysEffectProps = {
  dialogId: string;
  onPrevious?: () => void;
  onNext?: () => void;
};

export const FilePreviewDialogNavigationHotkeysEffect = ({
  dialogId,
  onPrevious,
  onNext,
}: FilePreviewDialogNavigationHotkeysEffectProps) => {
  useHotkeysOnFocusedElement({
    keys: [Key.ArrowLeft],
    callback: () => onPrevious?.(),
    focusId: dialogId,
    dependencies: [onPrevious],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowRight],
    callback: () => onNext?.(),
    focusId: dialogId,
    dependencies: [onNext],
  });

  return null;
};
