export type PlaybookStep = {
  num: string;
  heading: string;
  body: string;
  bullets?: string[];
  pills?: string[];
  note?: string;
  variant: 'step' | 'lastStep';
};
