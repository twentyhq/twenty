import { H2Title, Section, Table, TableBody, TableHeader } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

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
      title="Available"
      description="Select one or several standard objects to activate below"
    />
    <Table>
      <StyledAvailableStandardObjectTableRow>
        <TableHeader></TableHeader>
        <TableHeader>Name</TableHeader>
        <TableHeader>Description</TableHeader>
        <TableHeader align="right">Fields</TableHeader>
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
