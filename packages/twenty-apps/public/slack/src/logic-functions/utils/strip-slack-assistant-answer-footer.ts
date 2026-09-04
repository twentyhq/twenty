// older versions of the bot appended this footer to every answer; still-live
// threads carry those messages, so replayed history keeps needing the strip
const ANSWER_FOOTER_PATTERN = /\n\n_Answered in [^\n_]+_$/;

export const stripSlackAssistantAnswerFooter = (text: string): string =>
  text.replace(ANSWER_FOOTER_PATTERN, '');
