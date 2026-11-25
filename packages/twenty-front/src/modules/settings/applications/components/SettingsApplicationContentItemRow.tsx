import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

import { SettingsApplicationContentItemCell } from '@/settings/applications/components/SettingsApplicationContentItemCell';
import { SettingsApplicationContentItemIcon } from '@/settings/applications/components/SettingsApplicationContentItemIcon';
import { useApplicationContentItemDisplay } from '@/settings/applications/hooks/useApplicationContentItemDisplay';
import { useApplicationContentItemSettingsPath } from '@/settings/applications/hooks/useApplicationContentItemSettingsPath';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentColumn } from '@/settings/applications/types/ApplicationContentColumn';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentLocation } from '@/settings/applications/types/ApplicationContentLocation';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';

type SettingsApplicationContentItemRowProps = {
  contentType: ApplicationContentType;
  content: ApplicationContent;
  item: ApplicationContentItem;
  columns: ApplicationContentColumn[];
  gridTemplateColumns: string;
  location: ApplicationContentLocation;
  installedApplicationId?: string;
};

export const SettingsApplicationContentItemRow = ({
  contentType,
  content,
  item,
  columns,
  gridTemplateColumns,
  location,
  installedApplicationId,
}: SettingsApplicationContentItemRowProps) => {
  const navigate = useNavigate();
  const { getItemLabel } = useApplicationContentItemDisplay(content);
  const getItemSettingsPath = useApplicationContentItemSettingsPath(
    installedApplicationId,
  );

  const settingsPath = getItemSettingsPath({ contentType, item });

  const nameCell = (
    <StyledNameTableCell minWidth="0" overflow="hidden">
      <SettingsApplicationContentItemIcon
        contentType={contentType}
        content={content}
        item={item}
      />
      <OverflowingTextWithTooltip text={getItemLabel({ contentType, item })} />
    </StyledNameTableCell>
  );

  // Rows hold count links, so the row navigates on click instead of being a link
  return (
    <TableRow
      gridTemplateColumns={gridTemplateColumns}
      onClick={
        isDefined(settingsPath) ? () => navigate(settingsPath) : undefined
      }
    >
      {isDefined(settingsPath) ? (
        <UndecoratedLink
          to={settingsPath}
          onClick={(event) => event.stopPropagation()}
        >
          {nameCell}
        </UndecoratedLink>
      ) : (
        nameCell
      )}
      {columns.map((column) => (
        <SettingsApplicationContentItemCell
          key={column.label.id}
          contentType={contentType}
          content={content}
          item={item}
          column={column}
          location={location}
        />
      ))}
    </TableRow>
  );
};
