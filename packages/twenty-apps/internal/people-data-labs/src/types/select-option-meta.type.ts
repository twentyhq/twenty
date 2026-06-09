import { type TagColor } from 'src/types/tag-color.type';

export type SelectOptionMeta = {
  key: string;
  value: string;
  label: string;
  color: TagColor;
  position: number;
};
