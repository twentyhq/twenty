import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';

export const NewAiChatSingleRecordCommand = () => {
  const { switchToNewChat } = useSwitchToNewAiChat();

  return <HeadlessEngineCommandWrapperEffect execute={switchToNewChat} />;
};
