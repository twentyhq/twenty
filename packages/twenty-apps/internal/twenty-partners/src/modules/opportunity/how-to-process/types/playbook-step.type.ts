import { type PlaybookSkill } from 'src/modules/opportunity/how-to-process/constants/playbook-skills';

export type PlaybookStep = {
  num: string;
  heading: string;
  body: string;
  bullets?: string[];
  pills?: string[];
  note?: string;
  skills?: readonly PlaybookSkill[];
};
