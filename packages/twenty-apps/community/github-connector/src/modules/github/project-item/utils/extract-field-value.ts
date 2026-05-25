import type { ProjectV2Item } from 'src/modules/github/project-item/types/project-v2-item';

export function extractAssigneeLogins(item: ProjectV2Item): string[] {
  for (const fv of item.fieldValues.nodes) {
    if (fv.field?.name !== 'Assignees') continue;
    if (fv.__typename === 'ProjectV2ItemFieldUserValue') {
      return fv.users.nodes.map((u) => u.login);
    }
  }
  return [];
}

export function extractFieldValue(
  item: ProjectV2Item,
  fieldName: string,
): string {
  for (const fv of item.fieldValues.nodes) {
    if (fv.field?.name !== fieldName) continue;

    switch (fv.__typename) {
      case 'ProjectV2ItemFieldSingleSelectValue':
        return fv.name;
      case 'ProjectV2ItemFieldIterationValue':
        return fv.title;
      case 'ProjectV2ItemFieldTextValue':
        return fv.text;
      case 'ProjectV2ItemFieldNumberValue':
        return String(fv.number);
      case 'ProjectV2ItemFieldUserValue':
        return fv.users.nodes.map((u) => u.login).join(', ');
    }
  }
  return '';
}
