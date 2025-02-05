import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { Button, H2Title, Section } from 'twenty-ui';
import { z } from 'zod';
import {
  useGetHostnameDetailsQuery,
  useUpdateWorkspaceMutation,
} from '~/generated/graphql';
import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Separator } from '@/settings/components/Separator';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableBody } from '@/ui/layout/table/components/TableBody';

const validationSchema = z
  .object({
    hostname: z
      .string()
      .regex(
        /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
        {
          message:
            "Invalid custom hostname. Custom hostnames have to be smaller than 256 characters in length, cannot be IP addresses, cannot contain spaces, cannot contain any special characters such as _~`!@#$%^*()=+{}[]|\\;:'\",<>/? and cannot begin or end with a '-' character.",
        },
      )
      .max(256)
      .nullable(),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

const StyledDomainFromWrapper = styled.div`
  align-items: center;
  display: flex;
`;

export const SettingsHostname = () => {
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const { data: getHostnameDetailsData } = useGetHostnameDetailsQuery();
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();

  const { t } = useLingui();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const {
    control,
    getValues,
    clearErrors,
    handleSubmit,
    formState: { isValid },
  } = useForm<Form>({
    mode: 'onSubmit',
    defaultValues: {
      hostname: currentWorkspace?.hostname ?? '',
    },
    resolver: zodResolver(validationSchema),
  });

  const handleDelete = async () => {
    try {
      if (!currentWorkspace) {
        throw new Error('Invalid form values');
      }

      await updateWorkspace({
        variables: {
          input: {
            hostname: null,
          },
        },
      });
    } catch (error) {
      control.setError('hostname', {
        type: 'manual',
        message: (error as Error).message,
      });
    }
  };

  const handleSave = async () => {
    const values = getValues();
    try {
      clearErrors();

      if (!values || !isValid || !currentWorkspace) {
        throw new Error('Invalid form values');
      }

      await updateWorkspace({
        variables: {
          input: {
            hostname: values.hostname,
          },
        },
      });

      setCurrentWorkspace({
        ...currentWorkspace,
        hostname: values.hostname,
      });
    } catch (error) {
      control.setError('hostname', {
        type: 'manual',
        message: (error as Error).message,
      });
    }
  };

  return (
    <Section>
      <H2Title title={t`Domain`} description={t`Set the name of your domain`} />
      <StyledDomainFromWrapper>
        <Controller
          name="hostname"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInputV2
              value={value ?? undefined}
              type="text"
              onChange={onChange}
              error={error?.message}
              fullWidth
            />
          )}
        />
      </StyledDomainFromWrapper>
      <Button onClick={handleSubmit(handleSave)} title={'save'}></Button>
      <Button onClick={handleSubmit(handleDelete)} title={'delete'}></Button>
      {getHostnameDetailsData?.getHostnameDetails && (
        <>
          <Table>
            <TableRow>
              <TableHeader align={'left'}>Name/File</TableHeader>
              <TableHeader align={'left'}>Type</TableHeader>
              <TableHeader align={'left'}>Value</TableHeader>
            </TableRow>
            <Separator></Separator>
            <TableBody>
              {getHostnameDetailsData?.getHostnameDetails?.records.map(
                (record) => {
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
                },
              )}
              <TableRow>
                <TableCell>
                  <TextInputV2
                    value={getHostnameDetailsData?.getHostnameDetails?.hostname}
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
            </TableBody>

            <Separator></Separator>
          </Table>
        </>
      )}

      {getHostnameDetailsData?.getHostnameDetails?.verificationErrors && (
        <pre>
          Errors:{' '}
          {getHostnameDetailsData?.getHostnameDetails?.verificationErrors}
        </pre>
      )}
      {getHostnameDetailsData?.getHostnameDetails?.status && (
        <pre>status: {getHostnameDetailsData?.getHostnameDetails?.status}</pre>
      )}
      {getHostnameDetailsData?.getHostnameDetails?.sslStatus && (
        <pre>
          ssl status: {getHostnameDetailsData?.getHostnameDetails?.sslStatus}
        </pre>
      )}
      {getHostnameDetailsData?.getHostnameDetails?.hostname.split('.')
        .length === 2 && (
        <>
          <H2Title
            title={t`Apex Domain Specific configuration`}
            description={t` By design CNAME record are not compatible with apex domain, use a
          registar and a DNS provider that support CNAME Flattening or aliasing:`}
          />
          <Table>
            <TableRow>
              <TableHeader align={'left'}>Provider</TableHeader>
              <TableHeader align={'left'}>Compatible</TableHeader>
              <TableHeader align={'left'}>Feature Name</TableHeader>
            </TableRow>
            <TableRow>
              <TableCell>Cloudflare DNS</TableCell>
              <TableCell>✅</TableCell>
              <TableCell>CNAME Flattening</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>AWS Route 53</TableCell>
              <TableCell>✅</TableCell>
              <TableCell>ALIAS</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Name.com</TableCell>
              <TableCell>✅</TableCell>
              <TableCell>ALIAS</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Porkbun</TableCell>
              <TableCell>✅</TableCell>
              <TableCell>ALIAS</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>DNS Made Easy</TableCell>
              <TableCell>✅</TableCell>
              <TableCell>ALIAS</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Gandi</TableCell>
              <TableCell>✅</TableCell>
              <TableCell>ALIAS</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>StackPath</TableCell>
              <TableCell>✅</TableCell>
              <TableCell>ALIAS</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Netlify DNS</TableCell>
              <TableCell>✅</TableCell>
              <TableCell>CNAME Flattening</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>GoDaddy</TableCell>
              <TableCell>❌</TableCell>
              <TableCell>No native ALIAS, offers redirection instead</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Namecheap</TableCell>
              <TableCell>❌</TableCell>
              <TableCell>No ALIAS on an apex domain</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Google Domains (now Squarespace Domains)</TableCell>
              <TableCell>❌</TableCell>
              <TableCell>No ALIAS support</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Dynadot</TableCell>
              <TableCell>❌</TableCell>
              <TableCell>No ALIAS, only standard A and CNAME records</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Hover</TableCell>
              <TableCell>❌</TableCell>
              <TableCell>No ALIAS support</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>1&1 Ionos</TableCell>
              <TableCell>❌</TableCell>
              <TableCell>
                Doesn't support ALIAS, only standard A and CNAME records
              </TableCell>
            </TableRow>
          </Table>
        </>
      )}
    </Section>
  );
};
