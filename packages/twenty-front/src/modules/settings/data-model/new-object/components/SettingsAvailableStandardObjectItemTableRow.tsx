import { isDefined } from 'twenty-shared/utils';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Checkbox } from 'twenty-ui/input';
import { useIcons } from 'twenty-ui/display';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export const AVAILABLE_STANDARD_OBJECTS_GRID_TEMPLATE_COLUMNS =
  '28px 148px 256px 80px';

type SettingsAvailableStandardObjectItemTableRowProps = {
  isSelected?: boolean;
  objectItem: ObjectMetadataItem;
  onClick?: () => void;
};

const StyledDescription = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SettingsAvailableStandardObjectItemTableRow = ({
  isSelected,
  objectItem,
  onClick,
}: SettingsAvailableStandardObjectItemTableRowProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const Icon = getIcon(objectItem.icon);

  return (
    <TableRow
      gridTemplateColumns={AVAILABLE_STANDARD_OBJECTS_GRID_TEMPLATE_COLUMNS}
      key={objectItem.namePlural}
      isSelected={isSelected}
      onClick={onClick}
    >
      <TableCell
        align="center"
        padding={`0 0 0 ${themeCssVariables.spacing[1]}`}
      >
        <Checkbox checked={!!isSelected} />
      </TableCell>
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
      >
        {isDefined(Icon) && <Icon size={theme.icon.size.md} />}
        {objectItem.labelPlural}
      </TableCell>
      <TableCell>
        <StyledDescription>{objectItem.description}</StyledDescription>
      </TableCell>
      <TableCell align="right">{objectItem.fields.length}</TableCell>
    </TableRow>
  );
};
