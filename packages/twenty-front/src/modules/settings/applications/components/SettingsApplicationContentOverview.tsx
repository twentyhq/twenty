import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SearchInput } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { normalizeSearchText } from 'twenty-ui/utilities';

import { SettingsApplicationContentTypeTable } from '@/settings/applications/components/SettingsApplicationContentTypeTable';
import { APPLICATION_CONTENT_SECTIONS } from '@/settings/applications/constants/ApplicationContentSections';
import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { useApplicationContentItemDisplay } from '@/settings/applications/hooks/useApplicationContentItemDisplay';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentLocation } from '@/settings/applications/types/ApplicationContentLocation';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { filterApplicationContentItemsBySearch } from '@/settings/applications/utils/filterApplicationContentItemsBySearch';

type SettingsApplicationContentOverviewProps = {
  content: ApplicationContent;
  location: ApplicationContentLocation;
};

export const SettingsApplicationContentOverview = ({
  content,
  location,
}: SettingsApplicationContentOverviewProps) => {
  const { t } = useLingui();
  const { getItemLabel } = useApplicationContentItemDisplay(content);
  const [searchTerm, setSearchTerm] = useState('');

  const getMatchingItemCount = (contentType: ApplicationContentType) => {
    const items = content[contentType];
    const typeLabel = t(APPLICATION_CONTENT_TYPE_CONFIGS[contentType].label);

    if (
      normalizeSearchText(typeLabel).includes(normalizeSearchText(searchTerm))
    ) {
      return items.length;
    }

    return filterApplicationContentItemsBySearch({
      items,
      searchTerm,
      getItemLabel: (item) => getItemLabel({ contentType, item }),
    }).length;
  };

  const sections = APPLICATION_CONTENT_SECTIONS.map((section) => ({
    ...section,
    rows: section.contentTypes
      .map((contentType) => ({
        contentType,
        count: getMatchingItemCount(contentType),
      }))
      .filter(({ count }) => count > 0),
  })).filter((section) => section.rows.length > 0);

  return (
    <>
      <Section.Root>
        <SearchInput
          placeholder={t`Search all resources...`}
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
      </Section.Root>
      {sections.map((section) => (
        <Section.Root key={section.title.id}>
          <Section.Header
            title={t(section.title)}
            description={t(section.description)}
          />
          <SettingsApplicationContentTypeTable
            rows={section.rows.map(({ contentType, count }) => ({
              contentType,
              count,
              secondaryText: t(
                APPLICATION_CONTENT_TYPE_CONFIGS[contentType].description,
              ),
            }))}
            secondaryColumnLabel={t`Description`}
            location={location}
          />
        </Section.Root>
      ))}
    </>
  );
};
