import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Checkbox } from 'twenty-ui/input';
import { useIcons } from 'twenty-ui/display';
import { styled } from '@linaria/react';
import React, { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAvailableStandardObjectItemTableRowProps = {
  isSelected?: boolean;
  objectItem: ObjectMetadataItem;
  onClick?: () => void;
};

export const StyledAvailableStandardObjectTableRow = (
  props: React.ComponentProps<typeof TableRow>,
) => (
  <TableRow
    gridTemplateColumns="28px 148px 256px 80px"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

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
        {!!Icon && <Icon size={theme.icon.size.md} />}
        {objectItem.labelPlural}
      </TableCell>
      <TableCell>
        <StyledDescription>{objectItem.description}</StyledDescription>
      </TableCell>
      <TableCell align="right">{objectItem.fields.length}</TableCell>
    </StyledAvailableStandardObjectTableRow>
  );
};
