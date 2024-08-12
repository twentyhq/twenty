import { OverflowingTextWithTooltip } from 'twenty-ui';

type TextDisplayProps = {
  text: string;
};

export const TextDisplay = ({ text }: TextDisplayProps) => (
  <OverflowingTextWithTooltip text={text} />
);
