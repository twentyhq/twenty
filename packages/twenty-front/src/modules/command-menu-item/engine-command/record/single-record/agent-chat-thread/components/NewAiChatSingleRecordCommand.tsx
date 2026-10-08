import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';

// Only offered outside the side panel, where a chat is on the main page, full
// page or in the inbox, so the new one takes the main page too
export const NewAiChatSingleRecordCommand = () => {
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });

  return <HeadlessEngineCommandWrapperEffect execute={switchToNewChat} />;
};
