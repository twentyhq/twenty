import { zodResolver } from '@hookform/resolvers/zod';
import { Button, H2Title, Section } from 'twenty-ui';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilState } from 'recoil';
import styled from '@emotion/styled';
import {
  useUpdateWorkspaceMutation,
  useGetHostnameDetailsLazyQuery,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { useEffect } from 'react';

const validationSchema = z
  .object({
    hostname: z
      .string()
      .regex(
        /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
        {
          message:
            'Hostname invalid. Use letters, numbers and dashes only and a valid first level domain. Example: twenty.app',
        },
      )
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
  const [getHostnameDetailsQuery, { data: getHostnameDetailsData }] =
    useGetHostnameDetailsLazyQuery();

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
    mode: 'onChange',
    delayError: 500,
    defaultValues: {
      hostname: currentWorkspace?.hostname ?? '',
    },
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    let pollIntervalFn: null | ReturnType<typeof setInterval> = null;
    if (isDefined(currentWorkspace?.hostname)) {
      pollIntervalFn = setInterval(async () => {
        try {
          const { data } = await getHostnameDetailsQuery({
            fetchPolicy: 'no-cache',
          });
          if (isDefined(data)) {
            console.log('Hostname details updated:', data);
            // Optionally, handle the data or stop polling based on conditions.
          }
        } catch (error) {
          console.error('Error polling hostname details:', error);
        }
      }, 3000);
    }

    return () => {
      if (isDefined(pollIntervalFn)) {
        clearInterval(pollIntervalFn);
      }
    };
  }, [currentWorkspace?.hostname, getHostnameDetailsQuery]);

  const handleDelete = async () => {
    try {
      if (!currentWorkspace) {
        throw new Error('Invalid form values');
      }

      const result = await updateWorkspace({
        variables: {
          input: {
            hostname: null,
          },
        },
      });

      console.log('>>>>>>>>>>>>>>', result);

      setCurrentWorkspace({
        ...currentWorkspace,
        hostname: undefined,
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

      const result = await updateWorkspace({
        variables: {
          input: {
            hostname: values.hostname,
          },
        },
      });

      console.log('>>>>>>>>>>>>>>', result);

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
      <H2Title title="Domain" description="Set the name of your domain" />
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
