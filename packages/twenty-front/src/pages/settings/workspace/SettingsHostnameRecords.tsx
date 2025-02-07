import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { Separator } from '@/settings/components/Separator';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { Table } from '@/ui/layout/table/components/Table';
import { CustomHostnameDetails } from '~/generated/graphql';
import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';

export const SettingsHostnameRecords = ({
  records,
  hostname,
  status,
}: {
  records: CustomHostnameDetails['records'];
  hostname: string;
  status: {
    ssl: string;
    ownership: string;
  };
}) => {
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();

  return (
    <Table>
      <TableRow>
        <TableHeader align={'left'}>Name</TableHeader>
        <TableHeader align={'left'}>Type</TableHeader>
        <TableHeader align={'left'}>Value</TableHeader>
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
            </TableRow>
          );
        })}
        {status.ssl === 'active' && status.ownership === 'active' && (
          <TableRow>
            <TableCell>
              <TextInputV2
                value={hostname}
                type="text"
                disabled
                sizeVariant="md"
              />
            </TableCell>
            <TableCell>
              <TextInputV2
                value="CNAME"
                type="text"
                disabled
                sizeVariant="md"
              />
            </TableCell>
            <TableCell>
              <TextInputV2
                value={defaultDomain}
                type="text"
                disabled
                sizeVariant="md"
              />
            </TableCell>
          </TableRow>
        )}
      </TableBody>

      <Separator></Separator>
    </Table>
  );
};