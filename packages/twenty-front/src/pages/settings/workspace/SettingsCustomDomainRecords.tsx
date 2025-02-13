import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { Separator } from '@/settings/components/Separator';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { Table } from '@/ui/layout/table/components/Table';
import { CustomDomainDetails } from '~/generated/graphql';

export const SettingsCustomDomainRecords = ({
  records,
}: {
  records: CustomDomainDetails['records'];
}) => {
  return (
    <Table>
      <TableRow>
        <TableHeader>Name</TableHeader>
        <TableHeader>Record Type</TableHeader>
        <TableHeader>Value</TableHeader>
        <TableHeader>Validation Type</TableHeader>
        <TableHeader>Status</TableHeader>
      </TableRow>
      <Separator></Separator>
      <TableBody>
        {records.map((record) => {
          return (
            <TableRow>
              <TableCell>
                <TextInputV2
                  value={record.key}
                  type="text"
                  disabled
                  sizeVariant="md"
                />
              </TableCell>
              <TableCell>
                <TextInputV2
                  value={record.type.toUpperCase()}
                  type="text"
                  disabled
                  sizeVariant="md"
                />
              </TableCell>
              <TableCell>
                <TextInputV2
                  value={record.value}
                  type="text"
                  disabled
                  sizeVariant="md"
                />
              </TableCell>
              <TableCell>
                <TextInputV2
                  value={record.validationType}
                  type="text"
                  disabled
                  sizeVariant="md"
                />
              </TableCell>
              <TableCell>
                <TextInputV2
                  value={record.status}
                  type="text"
                  disabled
                  sizeVariant="md"
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
