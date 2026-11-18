export const scrollAiChatToBottom = (
  scrollWrapperElement: Pick<HTMLElement, 'scrollHeight' | 'scrollTop'>,
) => {
  scrollWrapperElement.scrollTop = scrollWrapperElement.scrollHeight;
};
