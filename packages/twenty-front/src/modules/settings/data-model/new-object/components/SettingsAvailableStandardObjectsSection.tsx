import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';

import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  SettingsAvailableStandardObjectItemTableRow,
  AVAILABLE_STANDARD_OBJECT_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
} from './SettingsAvailableStandardObjectItemTableRow';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsAvailableStandardObjectsSectionProps = {
  objectItems: ObjectMetadataItem[];
  onChange: (selectedIds: Record<string, boolean>) => void;
  selectedIds: Record<string, boolean>;
};

export const SettingsAvailableStandardObjectsSection = ({
  objectItems,
  onChange,
  selectedIds,
}: SettingsAvailableStandardObjectsSectionProps) => (
  <Section>
    <H2Title
      title={t`Available`}
      description={t`Select one or several standard objects to activate below`}
    />
    <Table>
      <TableRow
        gridTemplateColumns={
          AVAILABLE_STANDARD_OBJECT_TABLE_ROW_GRID_TEMPLATE_COLUMNS
        }
      >
        <TableHeader></TableHeader>
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader>{t`Description`}</TableHeader>
        <TableHeader align="right">{t`Fields`}</TableHeader>
      </TableRow>
      <TableBody>
        {objectItems.map((objectItem) => (
          <SettingsAvailableStandardObjectItemTableRow
            key={objectItem.id}
            isSelected={selectedIds[objectItem.id]}
            objectItem={objectItem}
            onClick={() =>
              onChange({
                ...selectedIds,
                [objectItem.id]: !selectedIds[objectItem.id],
              })
            }
          />
        ))}
      </TableBody>
    </Table>
  </Section>
);
