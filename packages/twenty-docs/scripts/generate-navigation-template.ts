import fs from 'fs';
import path from 'path';

type BasePage = string | BaseGroup;

type BaseGroup = {
  key: string;
  label: string;
  pages: BasePage[];
};

type BaseTab = {
  key: string;
  label: string;
  groups: BaseGroup[];
};

type BaseStructure = {
  tabs: BaseTab[];
};

type TemplateGroup = {
  label: string;
  groups?: Record<string, TemplateGroup>;
};

type TemplateTab = {
  label: string;
  groups: Record<string, TemplateGroup>;
};

type TemplateFile = {
  tabs: Record<string, TemplateTab>;
};

const baseStructurePath = path.resolve(
  __dirname,
  '../navigation/base-structure.json',
);
const templatePath = path.resolve(
  __dirname,
  '../navigation/navigation.template.json',
);

const baseStructure: BaseStructure = JSON.parse(
  fs.readFileSync(baseStructurePath, 'utf8'),
);

const buildGroupMap = (
  groups: BaseGroup[],
): Record<string, TemplateGroup> =>
  groups.reduce<Record<string, TemplateGroup>>((acc, group) => {
    const nestedGroups = group.pages.filter(
      (page): page is BaseGroup => typeof page !== 'string',
    );

    acc[group.key] = {
      label: group.label,
      ...(nestedGroups.length > 0
        ? { groups: buildGroupMap(nestedGroups) }
        : {}),
    };

    return acc;
  }, {});

const template: TemplateFile = {
  tabs: baseStructure.tabs.reduce<Record<string, TemplateTab>>(
    (acc, tab) => ({
      ...acc,
      [tab.key]: {
        label: tab.label,
        groups: buildGroupMap(tab.groups),
      },
    }),
    {},
  ),
};

fs.writeFileSync(templatePath, `${JSON.stringify(template, null, 2)}\n`);

