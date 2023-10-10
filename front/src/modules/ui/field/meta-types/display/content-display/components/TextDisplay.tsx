import { EllipsisDisplay } from './EllipsisDisplay';

type TextDisplayProps = {
  text: string;
};

export const TextDisplay = ({ text }: TextDisplayProps) => (
  <EllipsisDisplay>{text}</EllipsisDisplay>
);
