import { isDefined } from 'twenty-shared/utils';
import { type UrlFilterGroup } from './mapRecordFilterGroupToUrlFilterGroup';

export const appendNestedUrlFilterGroupsToQueryParams = (
  urlFilterGroups: UrlFilterGroup[],
  queryParamsPrefix: string,
  targetQueryParams: URLSearchParams,
): void => {
  for (const [groupIndex, urlFilterGroup] of urlFilterGroups.entries()) {
    const currentGroupPrefix = `${queryParamsPrefix}[${groupIndex}]`;
    targetQueryParams.set(
      `${currentGroupPrefix}[operator]`,
      urlFilterGroup.operator,
    );

    if (isDefined(urlFilterGroup.filters)) {
      for (const [filterIndex, urlFilter] of urlFilterGroup.filters.entries()) {
        targetQueryParams.set(
          `${currentGroupPrefix}[filters][${filterIndex}][field]`,
          urlFilter.field,
        );
        targetQueryParams.set(
          `${currentGroupPrefix}[filters][${filterIndex}][op]`,
          urlFilter.op,
        );
        targetQueryParams.set(
          `${currentGroupPrefix}[filters][${filterIndex}][value]`,
          urlFilter.value,
        );
        if (isDefined(urlFilter.subField)) {
          targetQueryParams.set(
            `${currentGroupPrefix}[filters][${filterIndex}][subField]`,
            urlFilter.subField,
          );
        }
      }
    }

    if (isDefined(urlFilterGroup.groups)) {
      appendNestedUrlFilterGroupsToQueryParams(
        urlFilterGroup.groups,
        `${currentGroupPrefix}[groups]`,
        targetQueryParams,
      );
    }
  }
};
