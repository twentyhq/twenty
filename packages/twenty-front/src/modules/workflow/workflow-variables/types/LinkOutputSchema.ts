type Link = {
  isLeaf: true;
  tab?: string;
  label?: string;
};

export type LinkOutputSchema = {
  link: Link;
  _outputSchemaType: 'LINK';
};
