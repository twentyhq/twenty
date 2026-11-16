import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

export const getApplicationContentIncludesText = ({
  contentType,
  items,
  getItemLabel,
  getObjectLabel,
  unknownObjectLabel,
  formatFieldCountOnObject,
}: {
  contentType: ApplicationContentType;
  items: ApplicationContentItem[];
  getItemLabel: (item: ApplicationContentItem) => string;
  getObjectLabel: (
    objectUniversalIdentifier: string | null | undefined,
  ) => string | undefined;
  unknownObjectLabel: string;
  formatFieldCountOnObject: (fieldCountOnObject: {
    count: number;
    objectLabel: string;
  }) => string;
}) => {
  if (contentType !== 'fields') {
    return items.map(getItemLabel).join(', ');
  }

  const fieldCountByObjectLabel = new Map<string, number>();

  for (const item of items) {
    const objectLabel =
      getObjectLabel(item.objectUniversalIdentifier) ?? unknownObjectLabel;

    fieldCountByObjectLabel.set(
      objectLabel,
      (fieldCountByObjectLabel.get(objectLabel) ?? 0) + 1,
    );
  }

  return [...fieldCountByObjectLabel.entries()]
    .map(([objectLabel, count]) =>
      formatFieldCountOnObject({ count, objectLabel }),
    )
    .join(', ');
};
