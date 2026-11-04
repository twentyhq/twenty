import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Section } from 'twenty-ui/components/layout';
import { useIcons } from 'twenty-ui/icon/provider';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { normalizeSearchText } from 'twenty-ui/utilities';

import { SettingsApplicationContentObjectFilter } from '@/settings/applications/components/SettingsApplicationContentObjectFilter';
import { SettingsApplicationContentTag } from '@/settings/applications/components/SettingsApplicationContentTag';
import { SettingsApplicationContentTypeIcon } from '@/settings/applications/components/SettingsApplicationContentTypeIcon';
import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { useApplicationContentItemDisplay } from '@/settings/applications/hooks/useApplicationContentItemDisplay';
import { useApplicationContentObjectResolver } from '@/settings/applications/hooks/useApplicationContentObjectResolver';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { APPLICATION_CONTENT_OBJECT_FILTER_SEARCH_PARAM } from '@/settings/applications/constants/ApplicationContentObjectFilterSearchParam';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsApplicationContentItemsTableProps = {
  contentType: ApplicationContentType;
  content: ApplicationContent;
  getContentTypePath: (contentType: ApplicationContentType) => string;
};

export const SettingsApplicationContentItemsTable = ({
  contentType,
  content,
  getContentTypePath,
}: SettingsApplicationContentItemsTableProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const resolveObject = useApplicationContentObjectResolver(content);
  const { getItemLabel, getItemIcon } =
    useApplicationContentItemDisplay(content);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const objectFilter = searchParams.get(
    APPLICATION_CONTENT_OBJECT_FILTER_SEARCH_PARAM,
  );

  const { label, secondaryColumn, countColumnLabel } =
    APPLICATION_CONTENT_TYPE_CONFIGS[contentType];

  const gridTemplateColumns = [
    'minmax(0, 1fr)',
    ...(isDefined(secondaryColumn) ? ['minmax(0, 1fr)'] : []),
    ...(isDefined(countColumnLabel) ? ['96px'] : []),
  ].join(' ');

  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const lowerCaseTypeLabel = t(label).toLowerCase();

  const objectFilterOptions = [
    ...new Set(
      content[contentType]
        .map((item) => item.objectUniversalIdentifier)
        .filter(isDefined),
    ),
  ]
    .map(resolveObject)
    .filter(isDefined);

  const selectedObject = objectFilterOptions.find(
    (object) => object.universalIdentifier === objectFilter,
  );

  const handleObjectFilterChange = (
    objectUniversalIdentifier: string | null,
  ) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (isDefined(objectUniversalIdentifier)) {
      nextSearchParams.set(
        APPLICATION_CONTENT_OBJECT_FILTER_SEARCH_PARAM,
        objectUniversalIdentifier,
      );
    } else {
      nextSearchParams.delete(APPLICATION_CONTENT_OBJECT_FILTER_SEARCH_PARAM);
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const items = content[contentType].filter(
    (item) =>
      (!isDefined(selectedObject) ||
        item.objectUniversalIdentifier ===
          selectedObject.universalIdentifier) &&
      normalizeSearchText(getItemLabel(contentType, item)).includes(
        normalizedSearchTerm,
      ),
  );

  const getItemColor = (item: ApplicationContentItem) => {
    if (contentType === 'objects') {
      return resolveObject(item.universalIdentifier)?.color;
    }

    if (contentType === 'navigationMenuItems') {
      return item.color ?? resolveObject(item.objectUniversalIdentifier)?.color;
    }

    return undefined;
  };

  const getItemLink = (item: ApplicationContentItem) => {
    if (contentType !== 'objects') {
      return undefined;
    }

    const fieldsSearchParams = new URLSearchParams({
      [APPLICATION_CONTENT_OBJECT_FILTER_SEARCH_PARAM]:
        item.universalIdentifier,
    });

    return `${getContentTypePath('fields')}?${fieldsSearchParams.toString()}`;
  };

  const renderItemIcon = (item: ApplicationContentItem) => {
    const itemIcon = getItemIcon(contentType, item);

    if (!isNonEmptyString(itemIcon)) {
      return <SettingsApplicationContentTypeIcon contentType={contentType} />;
    }

    const ItemIcon = getIcon(itemIcon);
    const itemColor = getItemColor(item);

    if (isDefined(itemColor)) {
      return (
        <ColoredIcon
          Icon={ItemIcon}
          color={itemColor}
          stroke={theme.icon.stroke.sm}
        />
      );
    }

    return <ItemIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;
  };

  const renderSecondaryCell = (item: ApplicationContentItem) => {
    switch (secondaryColumn?.source) {
      case 'description':
        return isDefined(item.description) ? (
          <OverflowingTextWithTooltip text={item.description} />
        ) : null;
      case 'parent':
        return isDefined(item.parentLabel) ? (
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

        if (!isDefined(object)) {
          return null;
        }

        return (
          <>
            <ColoredIcon
              Icon={getIcon(object.icon)}
              color={object.color}
              stroke={theme.icon.stroke.sm}
            />
            <OverflowingTextWithTooltip text={object.label} />
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t(label)}
        description={t(
          APPLICATION_CONTENT_TYPE_CONFIGS[contentType].description,
        )}
      />
      <SearchInput
        placeholder={t`Search ${lowerCaseTypeLabel}...`}
        value={searchTerm}
        onValueChange={setSearchTerm}
        actions={
          objectFilterOptions.length > 0 ? (
            <>
              {isDefined(selectedObject) && (
                <Button
                  variant="soft"
                  size="sm"
                  startIcon={
                    <ColoredIcon
                      Icon={getIcon(selectedObject.icon)}
                      color={selectedObject.color}
                      size={theme.icon.size.sm}
                    />
                  }
                  endIcon={<IconX />}
                  aria-label={t`Clear object filter`}
                  onClick={() => handleObjectFilterChange(null)}
                >
                  {selectedObject.label}
                </Button>
              )}
              <SettingsApplicationContentObjectFilter
                options={objectFilterOptions}
                selectedObjectUniversalIdentifier={
                  selectedObject?.universalIdentifier ?? null
                }
                onChange={handleObjectFilterChange}
              />
            </>
          ) : undefined
        }
      />
      <Table>
        <TableRow gridTemplateColumns={gridTemplateColumns}>
          <TableHeader>{t`Name`}</TableHeader>
          {isDefined(secondaryColumn) && (
            <TableHeader>{t(secondaryColumn.label)}</TableHeader>
          )}
          {isDefined(countColumnLabel) && (
            <TableHeader align="right">{t(countColumnLabel)}</TableHeader>
          )}
        </TableRow>
        {items.map((item) => (
          <TableRow
            key={item.universalIdentifier}
            gridTemplateColumns={gridTemplateColumns}
            to={getItemLink(item)}
          >
            <StyledNameTableCell minWidth="0" overflow="hidden">
              {renderItemIcon(item)}
              <OverflowingTextWithTooltip
                text={getItemLabel(contentType, item)}
              />
            </StyledNameTableCell>
            {isDefined(secondaryColumn) && (
              <TableCell
                color={themeCssVariables.font.color.secondary}
                gap={themeCssVariables.spacing[1]}
                minWidth="0"
                overflow="hidden"
              >
                {renderSecondaryCell(item)}
              </TableCell>
            )}
            {isDefined(countColumnLabel) && (
              <TableCell
                align="right"
                color={themeCssVariables.font.color.secondary}
              >
                {item.count}
              </TableCell>
            )}
          </TableRow>
        ))}
      </Table>
    </Section.Root>
  );
};
