import { EllipsisDisplay } from './EllipsisDisplay';

type JsonDisplayProps = {
  text: string;
  maxWidth?: number;
};

export const JsonDisplay = ({ text, maxWidth }: JsonDisplayProps) => (
  <EllipsisDisplay maxWidth={maxWidth}>{text}</EllipsisDisplay>
);
