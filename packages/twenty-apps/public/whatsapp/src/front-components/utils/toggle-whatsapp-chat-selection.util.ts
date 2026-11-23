export const toggleWhatsappChatSelection = ({
  selectedChatIds,
  chatId,
}: {
  selectedChatIds: string[];
  chatId: string;
}): string[] =>
  selectedChatIds.includes(chatId)
    ? selectedChatIds.filter((selectedChatId) => selectedChatId !== chatId)
    : [...selectedChatIds, chatId];
