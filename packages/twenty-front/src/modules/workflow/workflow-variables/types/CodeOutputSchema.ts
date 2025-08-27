import { type BaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/BaseOutputSchemaV2';

type Link = {
  isLeaf: true;
  tab?: string;
  label?: string;
};

export type LinkOutputSchema = {
  link: Link;
  _outputSchemaType: 'LINK';
};

export type CodeOutputSchema = LinkOutputSchema | BaseOutputSchemaV2;
