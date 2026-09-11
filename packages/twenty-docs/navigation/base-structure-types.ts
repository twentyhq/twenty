type BasePage = string | BaseGroup;

export type BaseGroup = {
  key: string;
  label: string;
  icon?: string;
  pages: BasePage[];
};

type BaseTab = {
  isEnglishOnly?: boolean;
  key: string;
  label: string;
  groups: BaseGroup[];
};

export type BaseStructure = {
  tabs: BaseTab[];
};
