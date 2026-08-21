// mirrors the footer appended by buildSlackAssistantAnswerText
const ANSWER_FOOTER_PATTERN = /\n\n_Answered in [^\n_]+_$/;

export const stripSlackAssistantAnswerFooter = (text: string): string =>
  text.replace(ANSWER_FOOTER_PATTERN, '');
