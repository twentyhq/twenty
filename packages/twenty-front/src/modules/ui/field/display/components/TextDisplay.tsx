import { OverflowingTextWithTooltip } from 'twenty-ui';

type TextDisplayProps = {
  text: string;
  displayMaxRows?: number;
};

export const TextDisplay = ({ text, displayMaxRows }: TextDisplayProps) => (
  <OverflowingTextWithTooltip text={text} displayMaxRows={displayMaxRows} />
);
