export const scrollInboxToBottom = (
  scrollWrapperElement: Pick<HTMLElement, 'scrollHeight' | 'scrollTop'>,
) => {
  scrollWrapperElement.scrollTop = scrollWrapperElement.scrollHeight;
};
