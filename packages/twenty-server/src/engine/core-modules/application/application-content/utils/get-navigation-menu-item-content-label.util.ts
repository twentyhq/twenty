import { isNonEmptyString } from '@sniptt/guards';

export const getNavigationMenuItemContentLabel = ({
  name,
  viewName,
  objectLabel,
  link,
  type,
}: {
  name: string | null | undefined;
  viewName: string | undefined;
  objectLabel: string | undefined;
  link: string | null | undefined;
  type: string;
}): string => {
  if (isNonEmptyString(name)) {
    return name;
  }

  if (isNonEmptyString(viewName)) {
    return viewName;
  }

  if (isNonEmptyString(objectLabel)) {
    return objectLabel;
  }

  return isNonEmptyString(link) ? link : type;
};
