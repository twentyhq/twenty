import { styled } from '@linaria/react';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Checkbox } from 'twenty-ui/input';
import { useIcons } from 'twenty-ui/display';
import { useContext } from 'react';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

type SettingsAvailableStandardObjectItemTableRowProps = {
  isSelected?: boolean;
  objectItem: ObjectMetadataItem;
  onClick?: () => void;
};

export const StyledAvailableStandardObjectTableRow = styled(TableRow)`
  grid-template-columns: 28px 148px 256px 80px;
`;

const StyledCheckboxTableCell = styled(TableCell)`
  justify-content: center;
  padding: 0;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${themeCssVariables.font.color.primary};
  gap: ${themeCssVariables.spacing[2]};
`;

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
    <StyledAvailableStandardObjectTableRow
      key={objectItem.namePlural}
      isSelected={isSelected}
      onClick={onClick}
    >
      <StyledCheckboxTableCell>
        <Checkbox checked={!!isSelected} />
      </StyledCheckboxTableCell>
      <StyledNameTableCell>
        {!!Icon && (
          <Icon
            size={parseFloat(theme.icon.size.md)}
          />
        )}
        {objectItem.labelPlural}
      </StyledNameTableCell>
      <TableCell>
        <StyledDescription>{objectItem.description}</StyledDescription>
      </TableCell>
      <TableCell align="right">{objectItem.fields.length}</TableCell>
    </StyledAvailableStandardObjectTableRow>
  );
};
