import { type ActivityLinkConfig } from '@/activities/hooks/useActivityLinkConfig';
import { useToggleActivityLink } from '@/activities/hooks/useToggleActivityLink';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type DocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { type ReactNode, useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useDebounce } from 'use-debounce';

export type LinkActivitiesSearchResults<TActivity> = {
  recordActivities: TActivity[];
  otherActivities: TActivity[];
};

export type LinkActivitiesOption = {
  label: string;
  description: string;
  startIcon: ReactNode;
};

export type LinkActivitiesLabels = {
  search: string;
  loading: string;
  empty: string;
  otherSection: string;
};

export type LinkActivitiesDropdownContentProps<
  TActivity extends { id: string },
  TSearchData,
> = {
  searchQuery: DocumentNode;
  getSearchResults: (
    data: TSearchData,
  ) => LinkActivitiesSearchResults<TActivity>;
  timelineQuery: DocumentNode;
  getOption: (activity: TActivity) => LinkActivitiesOption;
  labels: LinkActivitiesLabels;
};

export const LinkActivitiesDropdownContent = <
  TActivity extends { id: string },
  TSearchData,
>({
  targetRecord,
  activityLinkConfig,
  searchQuery,
  getSearchResults,
  timelineQuery,
  getOption,
  labels,
}: LinkActivitiesDropdownContentProps<TActivity, TSearchData> & {
  targetRecord: Pick<ActivityTargetableObject, 'id'>;
  activityLinkConfig: ActivityLinkConfig;
}) => {
  const apolloCoreClient = useApolloCoreClient();
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const [debouncedSearch] = useDebounce(trimmedSearch, 300);

  const { relatedCompany } = activityLinkConfig;

  const { data, loading } = useQuery<TSearchData>(searchQuery, {
    client: apolloCoreClient,
    variables: {
      objectNameSingular: CoreObjectNameSingular.Company,
      recordId: relatedCompany.id,
      searchInput: debouncedSearch,
    },
  });

  const { recordActivities, otherActivities } = isDefined(data)
    ? getSearchResults(data)
    : { recordActivities: [], otherActivities: [] };

  const { linkedActivityIds, pendingActivityIds, toggleActivityLink } =
    useToggleActivityLink({
      targetRecord,
      activityLinkConfig,
      activityIds: [...recordActivities, ...otherActivities].map(
        ({ id }) => id,
      ),
      timelineQuery,
    });

  const areActivitiesStale = loading || debouncedSearch !== trimmedSearch;

  const renderOption = (activity: TActivity) => {
    const { label, description, startIcon } = getOption(activity);

    return (
      <Dropdown.OptionItem
        key={activity.id}
        value={activity.id}
        selected={linkedActivityIds.has(activity.id)}
        indicator="checkbox"
        disabled={
          areActivitiesStale || pendingActivityIds.includes(activity.id)
        }
        startIcon={startIcon}
        description={description}
        onSelect={() => toggleActivityLink(activity.id)}
      >
        {label}
      </Dropdown.OptionItem>
    );
  };

  return (
    <>
      <Dropdown.Search
        aria-label={labels.search}
        placeholder={labels.search}
        value={search}
        onValueChange={setSearch}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable label={relatedCompany.name}>
        {recordActivities.map(renderOption)}
        {recordActivities.length === 0 &&
          (areActivitiesStale ? (
            <Dropdown.Loading>{labels.loading}</Dropdown.Loading>
          ) : (
            <Dropdown.Empty>{labels.empty}</Dropdown.Empty>
          ))}
      </Dropdown.Section>
      {otherActivities.length > 0 && (
        <>
          <Dropdown.Separator />
          <Dropdown.Section scrollable label={labels.otherSection}>
            {otherActivities.map(renderOption)}
          </Dropdown.Section>
        </>
      )}
    </>
  );
};
