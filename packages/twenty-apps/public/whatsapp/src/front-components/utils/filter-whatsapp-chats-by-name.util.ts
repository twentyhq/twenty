export const filterWhatsappChatsByName = <TChat extends { name: string }>({
  chats,
  search,
}: {
  chats: TChat[];
  search: string;
}): TChat[] => {
  const normalizedSearch = search.trim().toLowerCase();

  return chats.filter((chat) =>
    chat.name.toLowerCase().includes(normalizedSearch),
  );
};
