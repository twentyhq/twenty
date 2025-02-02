import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { Button, H2Title, Section } from 'twenty-ui';
import { z } from 'zod';
import {
  useGetHostnameDetailsQuery,
  useUpdateWorkspaceMutation,
} from '~/generated/graphql';

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

  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
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

      redirectToWorkspaceDomain(currentWorkspace.subdomain);
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

      // redirectToWorkspaceDomain(values.subdomain);
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
      {isDefined(getHostnameDetailsData?.getHostnameDetails?.hostname) && (
        <pre>
          {getHostnameDetailsData.getHostnameDetails.hostname} CNAME
          app.twenty-main.com
        </pre>
      )}
      {getHostnameDetailsData && (
        <pre>{JSON.stringify(getHostnameDetailsData, null, 4)}</pre>
      )}
    </Section>
  );
};
