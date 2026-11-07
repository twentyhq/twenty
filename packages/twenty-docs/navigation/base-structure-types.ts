export type BasePage = string | BaseGroup;

export type BaseGroup = {
  key: string;
  label: string;
  icon?: string;
  root?: string;
  pages: BasePage[];
};

type BaseTab = {
  key: string;
  label: string;
  groups: BaseGroup[];
};

export type BaseStructure = {
  tabs: BaseTab[];
};
