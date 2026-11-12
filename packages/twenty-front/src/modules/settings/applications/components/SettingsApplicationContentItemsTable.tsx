import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsApplicationContentFilterActions } from '@/settings/applications/components/SettingsApplicationContentFilterActions';
import { SettingsApplicationContentItemRow } from '@/settings/applications/components/SettingsApplicationContentItemRow';
import { APPLICATION_CONTENT_COLUMN_WIDTH_BY_SOURCE } from '@/settings/applications/constants/ApplicationContentColumnWidthBySource';
import { APPLICATION_CONTENT_RIGHT_ALIGNED_COLUMN_SOURCES } from '@/settings/applications/constants/ApplicationContentRightAlignedColumnSources';
import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { useApplicationContentItemDisplay } from '@/settings/applications/hooks/useApplicationContentItemDisplay';
import { useApplicationContentListFilters } from '@/settings/applications/hooks/useApplicationContentListFilters';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentLocation } from '@/settings/applications/types/ApplicationContentLocation';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { filterApplicationContentItemsBySearch } from '@/settings/applications/utils/filterApplicationContentItemsBySearch';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

type SettingsApplicationContentItemsTableProps = {
  contentType: ApplicationContentType;
  content: ApplicationContent;
  location: ApplicationContentLocation;
  installedApplicationId?: string;
};

export const SettingsApplicationContentItemsTable = ({
  contentType,
  content,
  location,
  installedApplicationId,
}: SettingsApplicationContentItemsTableProps) => {
  const { t } = useLingui();
  const { getItemLabel } = useApplicationContentItemDisplay(content);
  const {
    activeFilters,
    selectableFilter,
    selectedSelectableValue,
    matchesActiveFilters,
  } = useApplicationContentListFilters({ contentType, content });
  const [searchTerm, setSearchTerm] = useState('');

  const { label, description, columns } =
    APPLICATION_CONTENT_TYPE_CONFIGS[contentType];
  const lowerCaseTypeLabel = t(label).toLowerCase();

  const gridTemplateColumns = [
    'minmax(0, 1fr)',
    ...columns.map(
      ({ source }) => APPLICATION_CONTENT_COLUMN_WIDTH_BY_SOURCE[source],
    ),
  ].join(' ');

  const items = filterApplicationContentItemsBySearch({
    items: content[contentType].filter(matchesActiveFilters),
    searchTerm,
    getItemLabel: (item) => getItemLabel({ contentType, item }),
  });

  const hasFilterActions =
    activeFilters.length > 0 || isDefined(selectableFilter);

  return (
    <Section.Root>
      <Section.Header title={t(label)} description={t(description)} />
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search ${lowerCaseTypeLabel}...`}
          value={searchTerm}
          onValueChange={setSearchTerm}
          actions={
            hasFilterActions && (
              <SettingsApplicationContentFilterActions
                activeFilters={activeFilters}
                selectableFilter={selectableFilter}
                selectedSelectableValue={selectedSelectableValue}
              />
            )
          }
        />
      </StyledSearchInputContainer>
      <Table>
        <TableRow gridTemplateColumns={gridTemplateColumns}>
          <TableHeader>{t`Name`}</TableHeader>
          {columns.map((column) => (
            <TableHeader
              key={column.label.id}
              align={
                APPLICATION_CONTENT_RIGHT_ALIGNED_COLUMN_SOURCES.has(
                  column.source,
                )
                  ? 'right'
                  : undefined
              }
            >
              {t(column.label)}
            </TableHeader>
          ))}
        </TableRow>
        {items.map((item) => (
          <SettingsApplicationContentItemRow
            key={item.universalIdentifier}
            contentType={contentType}
            content={content}
            item={item}
            columns={columns}
            gridTemplateColumns={gridTemplateColumns}
            location={location}
            installedApplicationId={installedApplicationId}
          />
        ))}
      </Table>
    </Section.Root>
  );
};
