import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { useIcons } from 'twenty-ui/icon/provider';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { normalizeSearchText } from 'twenty-ui/utilities';

import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';
import { SettingsApplicationContentFilterDropdown } from '@/settings/applications/components/SettingsApplicationContentFilterDropdown';
import { SettingsApplicationContentTag } from '@/settings/applications/components/SettingsApplicationContentTag';
import { SettingsApplicationContentTypeIcon } from '@/settings/applications/components/SettingsApplicationContentTypeIcon';
import { APPLICATION_CONTENT_FILTER_LABELS } from '@/settings/applications/constants/ApplicationContentFilterLabels';
import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { useApplicationContentFilters } from '@/settings/applications/hooks/useApplicationContentFilters';
import { useApplicationContentItemSettingsPath } from '@/settings/applications/hooks/useApplicationContentItemSettingsPath';
import { useApplicationContentItemDisplay } from '@/settings/applications/hooks/useApplicationContentItemDisplay';
import { useApplicationContentObjectResolver } from '@/settings/applications/hooks/useApplicationContentObjectResolver';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentColumn } from '@/settings/applications/types/ApplicationContentColumn';
import { type ApplicationContentColumnSource } from '@/settings/applications/types/ApplicationContentColumnSource';
import { type ApplicationContentFilterKey } from '@/settings/applications/types/ApplicationContentFilterKey';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentLocation } from '@/settings/applications/types/ApplicationContentLocation';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { getApplicationContentPath } from '@/settings/applications/utils/getApplicationContentPath';
import { isNavigationMenuItemType } from '@/settings/applications/utils/isNavigationMenuItemType';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { Table } from '@/ui/layout/table/components/Table';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const COLUMN_WIDTH_BY_SOURCE: Record<ApplicationContentColumnSource, string> = {
  description: 'minmax(0, 1.5fr)',
  object: 'minmax(0, 1fr)',
  parent: 'minmax(0, 1fr)',
  tag: 'minmax(0, 148px)',
  count: '88px',
  position: '88px',
  duration: '88px',
};

const RIGHT_ALIGNED_COLUMN_SOURCES = new Set<ApplicationContentColumnSource>([
  'count',
  'position',
  'duration',
]);

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
  const theme = useTheme();
  const { getIcon } = useIcons();
  const resolveObject = useApplicationContentObjectResolver(content);
  const { getItemLabel, getItemIcon } =
    useApplicationContentItemDisplay(content);
  const filters = useApplicationContentFilters({ contentType, content });
  const getItemSettingsPath = useApplicationContentItemSettingsPath(
    installedApplicationId,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { label, description, columns } =
    APPLICATION_CONTENT_TYPE_CONFIGS[contentType];

  const gridTemplateColumns = [
    'minmax(0, 1fr)',
    ...columns.map(({ source }) => COLUMN_WIDTH_BY_SOURCE[source]),
  ].join(' ');

  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const lowerCaseTypeLabel = t(label).toLowerCase();

  const activeFilters = filters.flatMap((filter) => {
    const selectedOption = filter.options.find(
      (option) => option.universalIdentifier === searchParams.get(filter.key),
    );

    return isDefined(selectedOption) ? [{ ...filter, selectedOption }] : [];
  });

  const selectableFilter = filters.find(
    (filter) => filter.isSelectable && filter.options.length > 0,
  );

  const setFilterValue = (
    filterKey: ApplicationContentFilterKey,
    universalIdentifier: string | null,
  ) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (isDefined(universalIdentifier)) {
      nextSearchParams.set(filterKey, universalIdentifier);
    } else {
      nextSearchParams.delete(filterKey);
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const items = content[contentType].filter(
    (item) =>
      activeFilters.every(({ getItemKeys, selectedOption }) =>
        getItemKeys(item).includes(selectedOption.universalIdentifier),
      ) &&
      normalizeSearchText(getItemLabel({ contentType, item })).includes(
        normalizedSearchTerm,
      ),
  );

  const getItemColor = (item: ApplicationContentItem) => {
    if (contentType === 'objects') {
      return resolveObject(item.universalIdentifier)?.color;
    }

    if (contentType === 'fields') {
      return resolveObject(item.objectUniversalIdentifier)?.color;
    }

    if (
      contentType === 'navigationMenuItems' &&
      isDefined(item.tag) &&
      isNavigationMenuItemType(item.tag)
    ) {
      return getNavigationMenuItemColor(
        { type: item.tag, color: item.color },
        resolveObject(item.objectUniversalIdentifier)?.colorSource,
      );
    }

    return undefined;
  };

  const renderItemIcon = (item: ApplicationContentItem) => {
    const itemIcon = getItemIcon({ contentType, item });

    if (!isNonEmptyString(itemIcon)) {
      return <SettingsApplicationContentTypeIcon contentType={contentType} />;
    }

    const ItemIcon = getIcon(itemIcon);
    const itemColor = getItemColor(item);

    return isDefined(itemColor) ? (
      <ColoredIcon
        Icon={ItemIcon}
        color={itemColor}
        stroke={theme.icon.stroke.sm}
      />
    ) : (
      <ItemIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
    );
  };

  // Rows hold count links, so the row navigates on click instead of being a link
  const getRowClickHandler = (item: ApplicationContentItem) => {
    const settingsPath = getItemSettingsPath({ contentType, item });

    return isDefined(settingsPath) ? () => navigate(settingsPath) : undefined;
  };

  const renderNameCell = (item: ApplicationContentItem) => {
    const nameCell = (
      <StyledNameTableCell minWidth="0" overflow="hidden">
        {renderItemIcon(item)}
        <OverflowingTextWithTooltip
          text={getItemLabel({ contentType, item })}
        />
      </StyledNameTableCell>
    );
    const settingsPath = getItemSettingsPath({ contentType, item });

    if (!isDefined(settingsPath)) {
      return nameCell;
    }

    return (
      <UndecoratedLink
        to={settingsPath}
        onClick={(event) => event.stopPropagation()}
      >
        {nameCell}
      </UndecoratedLink>
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = seconds / 60;

    return Number.isInteger(minutes) ? t`${minutes} min` : t`${seconds} s`;
  };

  const renderCell = ({
    item,
    column: { source },
  }: {
    item: ApplicationContentItem;
    column: ApplicationContentColumn;
  }) => {
    switch (source) {
      case 'description':
        return isNonEmptyString(item.description) ? (
          <OverflowingTextWithTooltip text={item.description} />
        ) : null;
      case 'parent':
        return isNonEmptyString(item.parentLabel) ? (
          <OverflowingTextWithTooltip text={item.parentLabel} />
        ) : null;
      case 'tag':
        return isDefined(item.tag) ? (
          <SettingsApplicationContentTag
            contentType={contentType}
            tag={item.tag}
          />
        ) : null;
      case 'object': {
        const object = resolveObject(item.objectUniversalIdentifier);

        return isDefined(object) ? (
          <>
            <ColoredIcon
              Icon={getIcon(object.icon)}
              color={object.color}
              stroke={theme.icon.stroke.sm}
            />
            <OverflowingTextWithTooltip text={object.label} />
          </>
        ) : null;
      }
      case 'duration':
        return isDefined(item.timeoutSeconds)
          ? formatDuration(item.timeoutSeconds)
          : null;
      case 'position':
        return item.position;
      case 'count':
        return item.count;
    }
  };

  const getCountLinkPath = ({
    item,
    column: { link },
  }: {
    item: ApplicationContentItem;
    column: ApplicationContentColumn;
  }) => {
    if (!isDefined(link) || !isDefined(item.count) || item.count === 0) {
      return undefined;
    }

    const linkSearchParams = new URLSearchParams({
      [link.filter]: item.universalIdentifier,
    });

    return `${getApplicationContentPath({ location, contentType: link.contentType })}?${linkSearchParams.toString()}`;
  };

  const renderColumnCell = ({
    item,
    column,
  }: {
    item: ApplicationContentItem;
    column: ApplicationContentColumn;
  }) => {
    const cell = (
      <TableCell
        align={
          RIGHT_ALIGNED_COLUMN_SOURCES.has(column.source) ? 'right' : undefined
        }
        color={themeCssVariables.font.color.secondary}
        gap={themeCssVariables.spacing[1]}
        minWidth="0"
        overflow="hidden"
      >
        {renderCell({ item, column })}
      </TableCell>
    );
    const countLinkPath = getCountLinkPath({ item, column });

    if (!isDefined(countLinkPath)) {
      return <Fragment key={column.label.id}>{cell}</Fragment>;
    }

    return (
      <UndecoratedLink
        key={column.label.id}
        to={countLinkPath}
        onClick={(event) => event.stopPropagation()}
      >
        {cell}
      </UndecoratedLink>
    );
  };

  const renderFilterActions = () => {
    if (activeFilters.length === 0 && !isDefined(selectableFilter)) {
      return undefined;
    }

    return (
      <>
        {activeFilters.map(({ key, selectedOption }) => (
          <SortOrFilterChip
            key={key}
            type="filter"
            labelKey={t(APPLICATION_CONTENT_FILTER_LABELS[key])}
            labelValue={`: ${selectedOption.label}`}
            Icon={getIcon(selectedOption.icon)}
            onRemove={() => setFilterValue(key, null)}
          />
        ))}
        {isDefined(selectableFilter) && (
          <SettingsApplicationContentFilterDropdown
            options={selectableFilter.options}
            selectedUniversalIdentifier={searchParams.get(selectableFilter.key)}
            onChange={(universalIdentifier) =>
              setFilterValue(selectableFilter.key, universalIdentifier)
            }
          />
        )}
      </>
    );
  };

  return (
    <Section.Root>
      <Section.Header title={t(label)} description={t(description)} />
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search ${lowerCaseTypeLabel}...`}
          value={searchTerm}
          onValueChange={setSearchTerm}
          actions={renderFilterActions()}
        />
      </StyledSearchInputContainer>
      <Table>
        <TableRow gridTemplateColumns={gridTemplateColumns}>
          <TableHeader>{t`Name`}</TableHeader>
          {columns.map((column) => (
            <TableHeader
              key={column.label.id}
              align={
                RIGHT_ALIGNED_COLUMN_SOURCES.has(column.source)
                  ? 'right'
                  : undefined
              }
            >
              {t(column.label)}
            </TableHeader>
          ))}
        </TableRow>
        {items.map((item) => (
          <TableRow
            key={item.universalIdentifier}
            gridTemplateColumns={gridTemplateColumns}
            onClick={getRowClickHandler(item)}
          >
            {renderNameCell(item)}
            {columns.map((column) => renderColumnCell({ item, column }))}
          </TableRow>
        ))}
      </Table>
    </Section.Root>
  );
};
