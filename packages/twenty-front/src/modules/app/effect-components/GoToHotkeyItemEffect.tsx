import { useGoToHotkeys } from '@/ui/utilities/hotkey/hooks/useGoToHotkeys';

export const GoToHotkeyItemEffect = (props: {
  hotkey: string;
  pathToNavigateTo: string;
}) => {
  const { hotkey, pathToNavigateTo } = props;

  useGoToHotkeys({ key: hotkey, location: pathToNavigateTo });

  return <></>;
};
