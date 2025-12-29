import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';

import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  SettingsAvailableStandardObjectItemTableRow,
  StyledAvailableStandardObjectTableRow,
} from './SettingsAvailableStandardObjectItemTableRow';

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
      <StyledAvailableStandardObjectTableRow>
        <TableHeader></TableHeader>
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader>{t`Description`}</TableHeader>
        <TableHeader align="right">{t`Fields`}</TableHeader>
      </StyledAvailableStandardObjectTableRow>
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
