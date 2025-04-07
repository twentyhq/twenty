import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import {
  areaCodeOptions,
  dontFowardOptions,
  extensionGroupOptions,
  fowardAllCallsOptions,
  pullCallsOptions,
  typeOptions,
} from '@/settings/service-center/telephony/components/forms/options';
import { useFindAllDialingPlans } from '@/settings/service-center/telephony/hooks/useFindAllDialingPlans';
import { useFindAllDids } from '@/settings/service-center/telephony/hooks/useFindAllDids';
import { useFindAllPABX } from '@/settings/service-center/telephony/hooks/useFindAllPABX';
import { Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';

const TelephonyMetadataFormSchema = z.object({
  id: z.string(),
  memberId: z.string().min(1),
  extensionNumber: z.string().length(4),
  type: z.string().min(1),
  extensionName: z.string().min(1),
  extensionGroup: z.string().optional(),
  dialingPlan: z.string().min(1),
  areaCode: z.string().min(1),
  SIPPassword: z.string().min(1),
  callerExternalID: z.string().min(1),
  pullCalls: z.string().min(1),
  listenToCalls: z.boolean(),
  recordCalls: z.boolean(),
  blockExtension: z.boolean(),
  enableMailbox: z.boolean(),
  emailForMailbox: z.string().optional(),
  fowardAllCalls: z.string().optional(),
  fowardOfflineWithoutService: z.string().optional(),
  extensionAllCallsOrOffline: z.string().optional(),
  externalNumberAllCallsOrOffline: z.string().optional(),
  destinyMailBoxAllCallsOrOffline: z.string().optional(),
  fowardBusyNotAvailable: z.string().optional(),
  extensionBusy: z.string().optional(),
  externalNumberBusy: z.string().optional(),
  destinyMailBoxBusy: z.string().optional(),
  advancedFowarding1: z.string().optional(),
  advancedFowarding2: z.string().optional(),
  advancedFowarding3: z.string().optional(),
  advancedFowarding4: z.string().optional(),
  advancedFowarding5: z.string().optional(),
  advancedFowarding1Value: z.string().optional(),
  advancedFowarding2Value: z.string().optional(),
  advancedFowarding3Value: z.string().optional(),
  advancedFowarding4Value: z.string().optional(),
  advancedFowarding5Value: z.string().optional(),
});

export const SettingsServiceCenterTelephonyFormSchema =
  TelephonyMetadataFormSchema.pick({
    memberId: true,
    extensionNumber: true,
    type: true,
    extensionName: true,
    extensionGroup: true,
    dialingPlan: true,
    areaCode: true,
    SIPPassword: true,
    callerExternalID: true,
    pullCalls: true,
    listenToCalls: true,
    recordCalls: true,
    blockExtension: true,
    enableMailbox: true,
    emailForMailbox: true,
    fowardAllCalls: true,
    fowardBusyNotAvailable: true,
    fowardOfflineWithoutService: true,
    extensionAllCallsOrOffline: true,
    externalNumberAllCallsOrOffline: true,
    externalNumberBusy: true,
    extensionBusy: true,
    destinyMailBoxAllCallsOrOffline: true,
    destinyMailBoxBusy: true,
    advancedFowarding1: true,
    advancedFowarding2: true,
    advancedFowarding3: true,
    advancedFowarding4: true,
    advancedFowarding5: true,
    advancedFowarding1Value: true,
    advancedFowarding2Value: true,
    advancedFowarding3Value: true,
    advancedFowarding4Value: true,
    advancedFowarding5Value: true,
  }).superRefine(() => {});

export type SettingsServiceCenterTelephonyFormSchemaValues = z.infer<
  typeof TelephonyMetadataFormSchema
>;

type SettingsServiceCenterTelephonyAboutFormProps = {
  disabled?: boolean;
  disableNameEdit?: boolean;
  activeTelephony?: Telephony;
};

const StyledFlex = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledToggleRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(5)};
`;

const StyledGrid = styled.div<{
  columns: number;
}>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, 1fr);
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: flex-end;
`;

const StyledAdvancedContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

export const SettingsServiceCenterTelephonyAboutForm = ({
  disabled,
  activeTelephony,
}: SettingsServiceCenterTelephonyAboutFormProps) => {
  const { dialingPlans, loading: loadingPlans } = useFindAllDialingPlans();
  const { dids, loading: loadingDids } = useFindAllDids();
  const { telephonyExtensions, loading: loadingPABX } = useFindAllPABX();

  const { control, reset, watch, setValue } =
    useFormContext<SettingsServiceCenterTelephonyFormSchemaValues>();

  const [hasEditedExtName, setHasEditedExtName] = useState<boolean>(false);
  const [
    hasEditedFowardAllCallsOrOfflineMailbox,
    setHasEditedFowardAllCallsOrOfflineMailbox,
  ] = useState<boolean>(false);

  const [hasEditedFowardBusyMailbox, setHasEditedFowardBusyMailbox] =
    useState<boolean>(false);

  const {
    fowardAllCalls,
    fowardBusyNotAvailable,
    fowardOfflineWithoutService,
    enableMailbox,
    emailForMailbox,
    advancedFowarding1,
    advancedFowarding2,
    advancedFowarding3,
    advancedFowarding4,
    advancedFowarding5,
  } = watch();

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const memberOptions = workspaceMembers.map((workspaceMember) => {
    const label =
      workspaceMember.name.firstName.trim() !== '' ||
      workspaceMember.name.lastName.trim() !== ''
        ? `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`
        : 'Name not provided';

    return {
      label: label,
      value: workspaceMember.id,
      avatarUrl: workspaceMember.avatarUrl,
    };
  });

  useEffect(() => {
    advancedFowarding1 === '9' &&
      setValue('advancedFowarding1Value', emailForMailbox);

    advancedFowarding2 === '9' &&
      setValue('advancedFowarding2Value', emailForMailbox);

    advancedFowarding3 === '9' &&
      setValue('advancedFowarding3Value', emailForMailbox);

    advancedFowarding4 === '9' &&
      setValue('advancedFowarding4Value', emailForMailbox);

    advancedFowarding5 === '9' &&
      setValue('advancedFowarding5Value', emailForMailbox);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    advancedFowarding1,
    advancedFowarding2,
    advancedFowarding3,
    advancedFowarding4,
    advancedFowarding5,
  ]);

  useEffect(() => {
    if (!activeTelephony) return;

    reset({
      memberId: activeTelephony.memberId,
      extensionNumber: activeTelephony.numberExtension,
      areaCode: activeTelephony.areaCode,
      callerExternalID: activeTelephony.callerExternalID,
      dialingPlan: activeTelephony.dialingPlan,
      emailForMailbox: activeTelephony.emailForMailbox,
      enableMailbox: activeTelephony.enableMailbox,
      extensionAllCallsOrOffline: activeTelephony.extensionAllCallsOrOffline,
      extensionGroup: activeTelephony.extensionGroup,
      extensionName: activeTelephony.extensionName,
      fowardAllCalls: activeTelephony.fowardAllCalls,
      fowardBusyNotAvailable: activeTelephony.fowardBusyNotAvailable,
      fowardOfflineWithoutService: activeTelephony.fowardOfflineWithoutService,
      listenToCalls: activeTelephony.listenToCalls,
      pullCalls: activeTelephony.pullCalls,
      recordCalls: activeTelephony.recordCalls,
      SIPPassword: activeTelephony.SIPPassword,
      type: activeTelephony.type,
      blockExtension: activeTelephony.blockExtension,
      externalNumberAllCallsOrOffline:
        activeTelephony.externalNumberAllCallsOrOffline,
      externalNumberBusy: activeTelephony.externalNumberBusy,
      extensionBusy: activeTelephony.extensionBusy,
      destinyMailBoxAllCallsOrOffline:
        activeTelephony.destinyMailboxAllCallsOrOffline,
      destinyMailBoxBusy: activeTelephony.destinyMailboxBusy,
      advancedFowarding1: activeTelephony.advancedFowarding1,
      advancedFowarding2: activeTelephony.advancedFowarding2,
      advancedFowarding3: activeTelephony.advancedFowarding3,
      advancedFowarding4: activeTelephony.advancedFowarding4,
      advancedFowarding5: activeTelephony.advancedFowarding5,
      advancedFowarding1Value: activeTelephony.advancedFowarding1Value,
      advancedFowarding2Value: activeTelephony.advancedFowarding2Value,
      advancedFowarding3Value: activeTelephony.advancedFowarding3Value,
      advancedFowarding4Value: activeTelephony.advancedFowarding4Value,
      advancedFowarding5Value: activeTelephony.advancedFowarding5Value,
    });
  }, [activeTelephony, reset]);

  const switchFowards = (
    fowardValue: string | undefined,
    fowardType: string,
  ) => {
    switch (fowardValue) {
      case undefined:
        return <></>;
      case '1':
        return (
          <Section>
            <Controller
              control={control}
              name={
                fowardType === 'AllOrOffline'
                  ? 'extensionAllCallsOrOffline'
                  : 'extensionBusy'
              }
              render={({ field }) => (
                <Select
                  disabled={disabled}
                  dropdownId={
                    fowardType === 'AllOrOffline'
                      ? 'extensionAllCallsOrOffline'
                      : 'extensionBusy'
                  }
                  label={'Extension'}
                  options={
                    !loadingPABX && telephonyExtensions?.length > 0
                      ? [
                          {
                            label: 'Choose an extension',
                            value: '',
                          },
                          ...telephonyExtensions.map((telephony) => ({
                            label: telephony.usuario_autenticacao || '',
                            value: telephony.numero || '',
                          })),
                        ]
                      : [
                          {
                            label: 'Loading',
                            value: '',
                          },
                        ]
                  }
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
          </Section>
        );
      case '8':
        return (
          <Section>
            <Controller
              control={control}
              name={
                fowardType === 'AllOrOffline'
                  ? 'externalNumberAllCallsOrOffline'
                  : 'externalNumberBusy'
              }
              render={({ field }) => (
                <TextInput
                  disabled={disabled}
                  label={'External Number'}
                  placeholder="External number"
                  fullWidth
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
          </Section>
        );
      case '9':
        return (
          <Section>
            <Controller
              control={control}
              name={
                fowardType === 'AllOrOffline'
                  ? 'destinyMailBoxAllCallsOrOffline'
                  : 'destinyMailBoxBusy'
              }
              render={({ field }) => (
                <TextInput
                  disabled={disabled}
                  label={'Mailbox'}
                  placeholder="email@email.com"
                  fullWidth
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);

                    fowardType === 'AllOrOffline' &&
                      setHasEditedFowardAllCallsOrOfflineMailbox(true);
                    fowardType === 'Busy' &&
                      setHasEditedFowardBusyMailbox(true);
                  }}
                />
              )}
            />
          </Section>
        );
    }
  };

  const switchAdvanced = (
    fowardValue: string | undefined,
    fowardNum: number,
  ) => {
    return (
      <Section>
        <Controller
          control={control}
          name={`advancedFowarding${fowardNum}Value` as any}
          render={({ field }) => {
            switch (fowardValue) {
              default:
                return <></>;
              case '1':
                return (
                  <Select
                    disabled={disabled}
                    dropdownId={`advancedFowarding${fowardNum}Value`}
                    label={`Extension ${fowardNum}`}
                    options={
                      !loadingPABX && telephonyExtensions?.length > 0
                        ? [
                            {
                              label: 'Choose an extension',
                              value: '',
                            },
                            ...telephonyExtensions.map((telephony) => ({
                              label: telephony.usuario_autenticacao || '',
                              value: telephony.numero || '',
                            })),
                          ]
                        : [
                            {
                              label: 'Loading',
                              value: '',
                            },
                          ]
                    }
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                );
              case '8':
                return (
                  <TextInput
                    disabled={disabled}
                    label={`External Number ${fowardNum}`}
                    placeholder="External number"
                    fullWidth
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                );
              case '9':
                return (
                  <TextInput
                    disabled={disabled}
                    label={`Mailbox ${fowardNum}`}
                    placeholder="email@email.com"
                    fullWidth
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                );
            }
          }}
        />
      </Section>
    );
  };

  const clearFowardBusyOptions = () => {
    setValue('extensionBusy', '');
    setValue('externalNumberBusy', '');
  };

  const clearFowardAllOrOfflineOptions = () => {
    setValue('extensionAllCallsOrOffline', '');
    setValue('externalNumberAllCallsOrOffline', '');
  };

  const clearAdvancedOptions = () => {
    setValue('advancedFowarding1Value', '');
    setValue('advancedFowarding2Value', '');
    setValue('advancedFowarding3Value', '');
    setValue('advancedFowarding4Value', '');
    setValue('advancedFowarding5Value', '');
    setValue('advancedFowarding1', '');
    setValue('advancedFowarding2', '');
    setValue('advancedFowarding3', '');
    setValue('advancedFowarding4', '');
    setValue('advancedFowarding5', '');
  };

  return (
    <>
      <StyledGrid columns={3}>
        <Section>
          <Controller
            control={control}
            name="memberId"
            render={({ field }) => (
              <Select
                disabled={disabled}
                dropdownId="member"
                label={'Member'}
                options={[
                  {
                    label: 'Choose Member',
                    value: '',
                  },
                  ...memberOptions,
                ]}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />
            )}
          />
        </Section>
        <Section>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                disabled={disabled}
                dropdownId="type"
                label={'Type'}
                options={typeOptions}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />
            )}
          />
        </Section>
        <Section>
          <Controller
            name="extensionNumber"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                fullWidth
                value={value}
                onChange={(val) => {
                  onChange(val);
                  if (!hasEditedExtName) {
                    setValue('extensionName', val);
                  }
                }}
                label="Extension number"
                placeholder="1234"
              />
            )}
          />
        </Section>
        <Section>
          <Controller
            name="extensionName"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                fullWidth
                value={value}
                onChange={(val) => {
                  onChange(val);
                  setHasEditedExtName(true);
                }}
                label="Extension name"
                placeholder="1234"
              />
            )}
          />
        </Section>
        <Section>
          <Controller
            control={control}
            name="extensionGroup"
            render={({ field }) => (
              <Select
                disabled={disabled}
                dropdownId="extensionGroup"
                label={'Extension group'}
                options={extensionGroupOptions}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />
            )}
          />
        </Section>
        <Section>
          <Controller
            control={control}
            name="dialingPlan"
            render={({ field }) => (
              <Select
                disabled={disabled}
                dropdownId="dialingPlan"
                label={'Dialing plan'}
                options={
                  !loadingPlans && dialingPlans?.length > 0
                    ? [
                        {
                          label: 'Choose a plan',
                          value: '',
                        },
                        ...dialingPlans.map((dialingPlan) => ({
                          label: dialingPlan.nome || '',
                          value: dialingPlan.plano_discagem_id || '',
                        })),
                      ]
                    : [
                        {
                          label: 'loading',
                          value: '',
                        },
                      ]
                }
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />
            )}
          />
        </Section>
        <Section>
          <Controller
            control={control}
            name="areaCode"
            render={({ field }) => (
              <Select
                disabled={disabled}
                dropdownId="areaCode"
                withSearchInput
                label={'Area Code'}
                options={areaCodeOptions}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />
            )}
          />
        </Section>
        <Section>
          <Controller
            name="SIPPassword"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                type="password"
                fullWidth
                value={value}
                onChange={(val) => {
                  val.length <= 8 && onChange(val);
                }}
                label="SIP password"
                placeholder="1234"
              />
            )}
          />
        </Section>
        <Section>
          <Controller
            control={control}
            name="callerExternalID"
            render={({ field }) => (
              <Select
                disabled={disabled}
                dropdownId="callerExternalID"
                label={'Caller external ID'}
                options={
                  !loadingDids && dids?.length > 0
                    ? [
                        {
                          label: 'Choose an option',
                          value: '',
                        },
                        ...dids.map((did) => ({
                          label: did.numero || '',
                          value: did.did_id || '',
                        })),
                      ]
                    : [
                        {
                          label: 'loading',
                          value: '',
                        },
                      ]
                }
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />
            )}
          />
        </Section>
      </StyledGrid>
      <Section>
        <Controller
          control={control}
          name="pullCalls"
          render={({ field }) => (
            <Select
              disabled={disabled}
              dropdownId="pullCalls"
              label={'Pull calls'}
              options={pullCallsOptions}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
              }}
            />
          )}
        />
      </Section>
      <Section>
        <StyledToggleRow>
          <Controller
            control={control}
            name="listenToCalls"
            render={({ field }) => (
              <StyledFlex>
                <StyledLabel>Listen to calls</StyledLabel>
                <Toggle
                  toggleSize="small"
                  disabled={disabled}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              </StyledFlex>
            )}
          />
          <Controller
            control={control}
            name="recordCalls"
            render={({ field }) => (
              <StyledFlex>
                <StyledLabel>Record calls</StyledLabel>
                <Toggle
                  toggleSize="small"
                  disabled={disabled}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              </StyledFlex>
            )}
          />
          <Controller
            control={control}
            name="blockExtension"
            render={({ field }) => (
              <StyledFlex>
                <StyledLabel>Block Extension</StyledLabel>
                <Toggle
                  toggleSize="small"
                  disabled={disabled}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              </StyledFlex>
            )}
          />
          <Controller
            control={control}
            name="enableMailbox"
            render={({ field }) => (
              <StyledFlex>
                <StyledLabel>Enable Mailbox</StyledLabel>
                <Toggle
                  toggleSize="small"
                  disabled={disabled}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              </StyledFlex>
            )}
          />
        </StyledToggleRow>
      </Section>
      {enableMailbox && (
        <Section>
          <Controller
            control={control}
            name="emailForMailbox"
            render={({ field }) => (
              <TextInput
                fullWidth
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  if (!hasEditedFowardAllCallsOrOfflineMailbox) {
                    setValue('destinyMailBoxAllCallsOrOffline', value);
                  }
                  if (!hasEditedFowardBusyMailbox) {
                    setValue('destinyMailBoxBusy', value);
                  }
                }}
                label="Email for mailbox"
                placeholder="email@email.com"
              />
            )}
          />
        </Section>
      )}
      <StyledFlex>
        <Section>
          <Controller
            control={control}
            name="fowardAllCalls"
            render={({ field }) => (
              <Select
                disabled={disabled}
                dropdownId="fowardAllCalls"
                label={'Foward All Calls'}
                options={fowardAllCallsOptions}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  clearFowardBusyOptions();
                  clearFowardAllOrOfflineOptions();
                  clearAdvancedOptions();
                }}
              />
            )}
          />
        </Section>
        {fowardAllCalls !== '0' &&
          fowardAllCalls !== '' &&
          fowardAllCalls !== '5' &&
          switchFowards(fowardAllCalls, 'AllOrOffline')}
      </StyledFlex>
      {fowardAllCalls === '0' && (
        <StyledGrid columns={!fowardBusyNotAvailable ? 1 : 2}>
          <Section>
            <Controller
              control={control}
              name="fowardBusyNotAvailable"
              render={({ field }) => (
                <Select
                  disabled={disabled}
                  dropdownId="fowardBusyNotAvailable"
                  label={'Foward Busy Not Available'}
                  options={dontFowardOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    clearFowardBusyOptions();
                  }}
                />
              )}
            />
          </Section>
          {switchFowards(fowardBusyNotAvailable, 'Busy')}
          <Section>
            <Controller
              control={control}
              name="fowardOfflineWithoutService"
              render={({ field }) => (
                <Select
                  disabled={disabled}
                  dropdownId="fowardOfflineWithoutService"
                  label={'Foward Offline Without Service'}
                  options={dontFowardOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    clearFowardAllOrOfflineOptions();
                  }}
                />
              )}
            />
          </Section>
          {switchFowards(fowardOfflineWithoutService, 'AllOrOffline')}
        </StyledGrid>
      )}
      {fowardAllCalls === '5' && (
        <StyledAdvancedContainer>
          <StyledFlex>
            <Section>
              <Controller
                control={control}
                name="advancedFowarding1"
                render={({ field }) => (
                  <Select
                    disabled={disabled}
                    dropdownId="advancedFowarding1"
                    label={'Fowarding 1'}
                    options={dontFowardOptions}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue('advancedFowarding1Value', '');
                    }}
                  />
                )}
              />
            </Section>
            {advancedFowarding1 && switchAdvanced(advancedFowarding1, 1)}
          </StyledFlex>
          {advancedFowarding1 && (
            <StyledFlex
              style={{
                marginTop: '8px',
              }}
            >
              <Section>
                <Controller
                  control={control}
                  name="advancedFowarding2"
                  render={({ field }) => (
                    <Select
                      disabled={disabled}
                      dropdownId="advancedFowarding2"
                      label={'Fowarding 2'}
                      options={dontFowardOptions}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        setValue('advancedFowarding2Value', '');
                      }}
                    />
                  )}
                />
              </Section>
              {advancedFowarding2 && switchAdvanced(advancedFowarding2, 2)}
            </StyledFlex>
          )}
          {advancedFowarding2 && (
            <StyledFlex
              style={{
                marginTop: '8px',
              }}
            >
              <Section>
                <Controller
                  control={control}
                  name="advancedFowarding3"
                  render={({ field }) => (
                    <Select
                      disabled={disabled}
                      dropdownId="advancedFowarding3"
                      label={'Fowarding 3'}
                      options={dontFowardOptions}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        setValue('advancedFowarding3Value', '');
                      }}
                    />
                  )}
                />
              </Section>
              {advancedFowarding3 && switchAdvanced(advancedFowarding3, 3)}
            </StyledFlex>
          )}
          {advancedFowarding3 && (
            <StyledFlex
              style={{
                marginTop: '8px',
              }}
            >
              <Section>
                <Controller
                  control={control}
                  name="advancedFowarding4"
                  render={({ field }) => (
                    <Select
                      disabled={disabled}
                      dropdownId="advancedFowarding4"
                      label={'Fowarding 4'}
                      options={dontFowardOptions}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        setValue('advancedFowarding4Value', '');
                      }}
                    />
                  )}
                />
              </Section>
              {advancedFowarding4 && switchAdvanced(advancedFowarding4, 4)}
            </StyledFlex>
          )}
          {advancedFowarding4 && (
            <StyledFlex
              style={{
                marginTop: '8px',
              }}
            >
              <Section>
                <Controller
                  control={control}
                  name="advancedFowarding5"
                  render={({ field }) => (
                    <Select
                      disabled={disabled}
                      dropdownId="advancedFowarding5"
                      label={'Fowarding 5'}
                      options={dontFowardOptions}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        setValue('advancedFowarding5Value', '');
                      }}
                    />
                  )}
                />
              </Section>
              {advancedFowarding4 && switchAdvanced(advancedFowarding5, 5)}
            </StyledFlex>
          )}
        </StyledAdvancedContainer>
      )}
    </>
  );
};
