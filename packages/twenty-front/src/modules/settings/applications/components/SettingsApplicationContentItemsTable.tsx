import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { useIcons } from 'twenty-ui/icon/provider';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { normalizeSearchText } from 'twenty-ui/utilities';

import { SettingsApplicationContentTag } from '@/settings/applications/components/SettingsApplicationContentTag';
import { SettingsApplicationContentTypeIcon } from '@/settings/applications/components/SettingsApplicationContentTypeIcon';
import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { useApplicationContentItemDisplay } from '@/settings/applications/hooks/useApplicationContentItemDisplay';
import { useApplicationContentObjectResolver } from '@/settings/applications/hooks/useApplicationContentObjectResolver';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsApplicationContentItemsTableProps = {
  contentType: ApplicationContentType;
  content: ApplicationContent;
};

export const SettingsApplicationContentItemsTable = ({
  contentType,
  content,
}: SettingsApplicationContentItemsTableProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const resolveObject = useApplicationContentObjectResolver(content);
  const { getItemLabel, getItemIcon } =
    useApplicationContentItemDisplay(content);
  const [searchTerm, setSearchTerm] = useState('');

  const { label, secondaryColumn, countColumnLabel } =
    APPLICATION_CONTENT_TYPE_CONFIGS[contentType];

  const gridTemplateColumns = [
    'minmax(0, 1fr)',
    ...(isDefined(secondaryColumn) ? ['minmax(0, 1fr)'] : []),
    ...(isDefined(countColumnLabel) ? ['96px'] : []),
  ].join(' ');

  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const lowerCaseTypeLabel = t(label).toLowerCase();

  const items = content[contentType].filter((item) =>
    normalizeSearchText(getItemLabel(contentType, item)).includes(
      normalizedSearchTerm,
    ),
  );

  const renderItemIcon = (item: ApplicationContentItem) => {
    const itemIcon = getItemIcon(contentType, item);

    if (!isNonEmptyString(itemIcon)) {
      return <SettingsApplicationContentTypeIcon contentType={contentType} />;
    }

    const ItemIcon = getIcon(itemIcon);

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

        const ObjectIcon = getIcon(object.icon);

        return (
          <>
            <ObjectIcon
              size={theme.icon.size.md}
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
