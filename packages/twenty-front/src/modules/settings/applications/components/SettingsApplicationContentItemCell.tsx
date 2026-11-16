import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { SettingsApplicationContentTag } from '@/settings/applications/components/SettingsApplicationContentTag';
import { APPLICATION_CONTENT_RIGHT_ALIGNED_COLUMN_SOURCES } from '@/settings/applications/constants/ApplicationContentRightAlignedColumnSources';
import { useApplicationContentObjectResolver } from '@/settings/applications/hooks/useApplicationContentObjectResolver';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentColumn } from '@/settings/applications/types/ApplicationContentColumn';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentLocation } from '@/settings/applications/types/ApplicationContentLocation';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { getApplicationContentPath } from '@/settings/applications/utils/getApplicationContentPath';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';

type SettingsApplicationContentItemCellProps = {
  contentType: ApplicationContentType;
  content: ApplicationContent;
  item: ApplicationContentItem;
  column: ApplicationContentColumn;
  location: ApplicationContentLocation;
};

export const SettingsApplicationContentItemCell = ({
  contentType,
  content,
  item,
  column,
  location,
}: SettingsApplicationContentItemCellProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const resolveObject = useApplicationContentObjectResolver(content);

  const formatDuration = (seconds: number) => {
    const minutes = seconds / 60;

    return Number.isInteger(minutes) ? t`${minutes} min` : t`${seconds} s`;
  };

  const renderValue = () => {
    switch (column.source) {
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

        if (!isDefined(object)) {
          return null;
        }

        return (
          <>
            <ObjectMetadataIcon
              objectMetadataItem={{ ...object.colorSource, icon: object.icon }}
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
            <OverflowingTextWithTooltip text={object.label} />
          </>
        );
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

  const cell = (
    <TableCell
      align={
        APPLICATION_CONTENT_RIGHT_ALIGNED_COLUMN_SOURCES.has(column.source)
          ? 'right'
          : undefined
      }
      color={themeCssVariables.font.color.secondary}
      gap={themeCssVariables.spacing[1]}
      minWidth="0"
      overflow="hidden"
    >
      {renderValue()}
    </TableCell>
  );

  const { link } = column;

  if (!isDefined(link) || !isDefined(item.count) || item.count === 0) {
    return cell;
  }

  const linkSearchParams = new URLSearchParams({
    [link.filter]: item.universalIdentifier,
  });

  return (
    <UndecoratedLink
      to={`${getApplicationContentPath({ location, contentType: link.contentType })}?${linkSearchParams.toString()}`}
      onClick={(event) => event.stopPropagation()}
    >
      {cell}
    </UndecoratedLink>
  );
};
