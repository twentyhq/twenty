export const prependAiChatQuoteToText = ({
  text,
  authorName,
  excerpt,
}: {
  text: string;
  authorName: string;
  excerpt: string;
}) => {
  const quote = `**${authorName}:** ${excerpt}`
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');

  return `${quote}\n\n${text}`;
};
